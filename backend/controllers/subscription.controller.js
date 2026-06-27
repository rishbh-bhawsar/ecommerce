const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { validationResult } = require('express-validator');
const { Price, Subscription, SubscriptionHistory, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { sendSubscriptionConfirmation, sendSubscriptionCancellation, sendPaymentFailed, sendSubscriptionRenewed, sendAdminNewSubscription } = require('../utils/mailer');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { name, amount, currency = "usd" } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency,
            unit_amount: Math.round(Number(amount) * 100), // Stripe expects cents
            product_data: {
              name,
            },
          },
          quantity: 1,
        },
      ],
       metadata: {
          userId: user.id,          // Your database user ID
          productId: product.id,    // Your database product ID
          productName: name,
        },

      success_url: "http://localhost:4200/payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:4200/payment-cancel",
    });

    return res.json({
      success: true,
      url: session.url,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.createPrice = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }

    const { name, description, amount, currency, interval, intervalCount } = req.body;

    const stripeProduct = await stripe.products.create({
      name,
      description,
    });

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(amount * 100),
      currency: currency || 'usd',
      recurring: {
        interval,
        interval_count: intervalCount || 1,
      },
    });

    const price = await Price.create({
      name,
      description,
      amount,
      currency: currency || 'usd',
      interval,
      intervalCount: intervalCount || 1,
      stripePriceId: stripePrice.id,
      stripeProductId: stripeProduct.id,
    });

    return sendSuccess(res, 'Price created successfully', { price }, 201);
  } catch (error) {
    next(error);
  }
};

exports.getAllPrices = async (req, res, next) => {
  try {
    const prices = await Price.findAll({ where: { isActive: true }, order: [['createdAt', 'DESC']] });
    return sendSuccess(res, 'Prices retrieved', { prices });
  } catch (error) {
    next(error);
  }
};

exports.getPriceById = async (req, res, next) => {
  try {
    const price = await Price.findByPk(req.params.id);
    if (!price) return sendError(res, 'Price not found', 404);
    return sendSuccess(res, 'Price retrieved', { price });
  } catch (error) {
    next(error);
  }
};

exports.updatePrice = async (req, res, next) => {
  try {
    const price = await Price.findByPk(req.params.id);
    if (!price) return sendError(res, 'Price not found', 404);

    const { name, description, isActive } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    await price.update(updateData);
    return sendSuccess(res, 'Price updated', { price });
  } catch (error) {
    next(error);
  }
};

exports.deletePrice = async (req, res, next) => {
  try {
    const price = await Price.findByPk(req.params.id);
    if (!price) return sendError(res, 'Price not found', 404);

    await price.update({ isActive: false });
    return sendSuccess(res, 'Price deactivated');
  } catch (error) {
    next(error);
  }
};

exports.createSubscription = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }

    const { priceId, paymentMethodId } = req.body;

    const price = await Price.findByPk(priceId);
    if (!price || !price.isActive) return sendError(res, 'Price not found or inactive', 404);

    let customer;
    const existingSub = await Subscription.findOne({ where: { userId: req.user.id, status: ['active', 'trialing'] } });
    if (existingSub && existingSub.stripeCustomerId) {
      customer = await stripe.customers.retrieve(existingSub.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });

    const stripeSubscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.stripePriceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    });

    const subscription = await Subscription.create({
      userId: req.user.id,
      priceId: price.id,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: stripeSubscription.id,
      stripePaymentMethodId: paymentMethodId,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
    });

    if (stripeSubscription.latest_invoice) {
      await SubscriptionHistory.create({
        subscriptionId: subscription.id,
        userId: req.user.id,
        stripeInvoiceId: stripeSubscription.latest_invoice.id,
        stripePaymentIntentId: stripeSubscription.latest_invoice.payment_intent,
        amount: price.amount,
        currency: price.currency,
        status: stripeSubscription.latest_invoice.status === 'paid' ? 'succeeded' : 'pending',
        description: `Subscription to ${price.name}`,
        paidAt: stripeSubscription.latest_invoice.status === 'paid' ? new Date() : null,
      });
    }

    sendSubscriptionConfirmation(req.user, subscription, price).catch(() => {});
    sendAdminNewSubscription(req.user, subscription, price).catch(() => {});

    return sendSuccess(res, 'Subscription created successfully', { subscription }, 201);
  } catch (error) {
    next(error);
  }
};

exports.getMySubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { userId: req.user.id },
      include: [{ model: Price, as: 'price' }],
      order: [['createdAt', 'DESC']],
    });
    return sendSuccess(res, 'Subscriptions retrieved', { subscriptions });
  } catch (error) {
    next(error);
  }
};

exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Subscription.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Price, as: 'price' },
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return sendSuccess(res, 'Subscriptions retrieved', {
      subscriptions: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Price, as: 'price' }],
    });
    if (!subscription) return sendError(res, 'Subscription not found', 404);
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return sendError(res, 'Subscription is not active', 400);
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, { cancel_at_period_end: true });

    await subscription.update({ cancelAtPeriodEnd: true });

    sendSubscriptionCancellation(req.user, subscription).catch(() => {});

    return sendSuccess(res, 'Subscription will be canceled at period end', { subscription });
  } catch (error) {
    next(error);
  }
};

exports.immediateCancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Price, as: 'price' }],
    });
    if (!subscription) return sendError(res, 'Subscription not found', 404);

    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    await subscription.update({ status: 'canceled', canceledAt: new Date() });

    sendSubscriptionCancellation(req.user, subscription).catch(() => {});

    return sendSuccess(res, 'Subscription canceled immediately', { subscription });
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptionHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await SubscriptionHistory.findAndCountAll({
      where: { userId: req.user.id },
      include: [{
        model: Subscription,
        as: 'subscription',
        include: [{ model: Price, as: 'price' }],
      }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return sendSuccess(res, 'Subscription history retrieved', {
      history: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      if (invoice.subscription) {
        const sub = await Subscription.findOne({ where: { stripeSubscriptionId: invoice.subscription } });
        if (sub) {
          const price = await Price.findByPk(sub.priceId);
          await SubscriptionHistory.create({
            subscriptionId: sub.id,
            userId: sub.userId,
            stripeInvoiceId: invoice.id,
            stripePaymentIntentId: invoice.payment_intent,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency,
            status: 'succeeded',
            description: `Subscription renewal - ${price ? price.name : 'Unknown'}`,
            paidAt: new Date(),
          });

          const user = await User.findByPk(sub.userId);
          if (user) sendSubscriptionRenewed(user, sub, price).catch(() => {});
        }
      }
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      if (invoice.subscription) {
        const sub = await Subscription.findOne({ where: { stripeSubscriptionId: invoice.subscription } });
        if (sub) {
          await sub.update({ status: 'past_due' });
          await SubscriptionHistory.create({
            subscriptionId: sub.id,
            userId: sub.userId,
            stripeInvoiceId: invoice.id,
            amount: invoice.amount_due / 100,
            currency: invoice.currency,
            status: 'failed',
            description: 'Payment failed',
          });

          const user = await User.findByPk(sub.userId);
          if (user) sendPaymentFailed(user, sub).catch(() => {});
        }
      }
      break;
    }
    case 'customer.subscription.updated': {
      const stripeSub = event.data.object;
      const sub = await Subscription.findOne({ where: { stripeSubscriptionId: stripeSub.id } });
      if (sub) {
        await sub.update({
          status: stripeSub.status,
          currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          canceledAt: stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000) : null,
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const stripeSub = event.data.object;
      const sub = await Subscription.findOne({ where: { stripeSubscriptionId: stripeSub.id } });
      if (sub) {
        await sub.update({ status: 'canceled', canceledAt: new Date() });
      }
      break;
    }
  }

  res.json({ received: true });
};
