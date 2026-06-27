const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { validationResult } = require('express-validator');
const { Order, OrderItem, Product, Cart, CartItem, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { getIO } = require('../config/socket');
const { Notification } = require('../models');
const { sendOrderConfirmation, sendOrderNotificationToAdmin, sendOrderStatusUpdate } = require('../utils/mailer');
const { sendTemplatedEmail } = require('../services/emailTemplate.service');

exports.createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }

    const { items } = req.body;

    let totalAmount = 0;
    const orderItems = [];
    const lineItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product || !product.isActive) {
        return sendError(res, `Product ${item.productId} not found`, 404);
      }
      if (product.stock < item.quantity) {
        return sendError(res, `Insufficient stock for ${product.name}`, 400);
      }

      const itemTotal = parseFloat(product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });

      lineItems.push({
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(parseFloat(product.price) * 100),
          product_data: {
            name: product.name,
            images: product.image ? [product.image] : [],
          },
        },
        quantity: item.quantity,
      });

      await product.update({ stock: product.stock - item.quantity });
    }

    const order = await Order.create({
      userId: req.user.id,
      productId: orderItems[0]?.productId || null,
      totalAmount,
      status: 'Pending',
      paymentStatus: 'Pending',
    });

    for (const item of orderItems) {
      await OrderItem.create({ orderId: order.id, ...item });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: req.user.email,
      metadata: {
        orderId: order.id,
        userId: req.user.id,
      },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/order-cancel?orderId=${order.id}`,
    });

    await order.update({ stripeSessionId: session.id });

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
    }

    const fullOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }],
      }],
    });

    return sendSuccess(res, 'Checkout session created', {
      order: fullOrder,
      checkoutUrl: session.url,
    }, 201);
  } catch (error) {
    next(error);
  }
};

const verifyPendingPayment = async (order) => {
  if (order.paymentStatus !== 'Pending' || !order.stripeSessionId) {
    return order;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    console.log(`Auto-verify Order #${order.id}: Stripe status = ${session.payment_status}`);

    if (session.payment_status === 'paid') {
      await order.update({
        paymentStatus: 'Paid',
        stripePaymentIntentId: session.payment_intent,
        status: 'Processing',
      });
      order.paymentStatus = 'Paid';
      order.status = 'Processing';
      console.log(`Order #${order.id} auto-updated to Paid`);
    } else if (session.payment_status === 'unpaid' && session.status === 'expired') {
      await order.update({ paymentStatus: 'Failed' });
      order.paymentStatus = 'Failed';
    }
  } catch (err) {
    console.error(`Auto-verify error for Order #${order.id}:`, err.message);
  }

  return order;
};

exports.getOrdersByRole = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (status) where.status = status;

    if (req.user.role === 'admin') {
      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }],
          },
        ],
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']],
      });

      for (let i = 0; i < rows.length; i++) {
        rows[i] = await verifyPendingPayment(rows[i]);
      }

      return sendSuccess(res, 'All orders retrieved', {
        orders: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      });
    } else {
      where.userId = req.user.id;

      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [{
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }],
        }],
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']],
      });

      for (let i = 0; i < rows.length; i++) {
        rows[i] = await verifyPendingPayment(rows[i]);
      }

      return sendSuccess(res, 'Your orders retrieved', {
        orders: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getOrderStats = async (req, res, next) => {
  try {
    const where = req.user.role !== 'admin' ? { userId: req.user.id } : {};

    const totalOrders = await Order.count({ where });
    const pendingOrders = await Order.count({ where: { ...where, status: 'Pending' } });
    const processingOrders = await Order.count({ where: { ...where, status: 'Processing' } });
    const shippedOrders = await Order.count({ where: { ...where, status: 'Shipped' } });
    const deliveredOrders = await Order.count({ where: { ...where, status: 'Delivered' } });
    const cancelledOrders = await Order.count({ where: { ...where, status: 'Cancelled' } });

    const paidOrders = await Order.count({ where: { ...where, paymentStatus: 'Paid' } });
    const pendingPayments = await Order.count({ where: { ...where, paymentStatus: 'Pending' } });

    const { Op } = require('sequelize');
    const totalSpent = await Order.sum('totalAmount', {
      where: { ...where, paymentStatus: 'Paid' },
    }) || 0;

    return sendSuccess(res, 'Order statistics', {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      paidOrders,
      pendingPayments,
      totalSpent: parseFloat(totalSpent).toFixed(2),
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Order.findAndCountAll({
      where: { userId: req.user.id },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }],
      }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    for (let i = 0; i < rows.length; i++) {
      rows[i] = await verifyPendingPayment(rows[i]);
    }

    return sendSuccess(res, 'Orders retrieved', {
      orders: rows,
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

exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (status) {
      where.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    for (let i = 0; i < rows.length; i++) {
      rows[i] = await verifyPendingPayment(rows[i]);
    }

    return sendSuccess(res, 'Orders retrieved', {
      orders: rows,
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

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }],
      }],
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (order.status === 'Cancelled') {
      return sendError(res, 'Order is already cancelled', 400);
    }

    if (order.status === 'Delivered') {
      return sendError(res, 'Cannot cancel delivered order', 400);
    }

    const { reason } = req.body;

    await order.update({
      status: 'Cancelled',
      paymentStatus: order.paymentStatus === 'Paid' ? 'Refunded' : 'Failed',
    });

    for (const item of order.items) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        await product.update({ stock: product.stock + item.quantity });
      }
    }

    const io = getIO();
    io.emit('order-updated', order);

    await Notification.create({
      title: 'Order Cancelled',
      message: `Order #${order.id} has been cancelled`,
      type: 'warning',
    });

    const user = await User.findByPk(order.userId);
    if (user) {
      sendTemplatedEmail('cancel_order', user.email, {
        userName: user.name,
        orderId: order.id.toString(),
        cancelReason: reason || 'No reason provided',
        refundInfo: order.paymentStatus === 'Paid'
          ? 'Your refund will be processed within 5-7 business days.'
          : 'No payment was captured for this order.',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
      }).catch(() => {});
    }

    return sendSuccess(res, 'Order cancelled successfully', { order });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    const oldStatus = order.status;
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    await order.update(updateData);

    const io = getIO();
    io.emit('order-updated', order);

    await Notification.create({
      title: 'Order Updated',
      message: `Order #${order.id} status updated to ${order.status}`,
      type: 'info',
    });

    if (status && status !== oldStatus) {
      const user = await User.findByPk(order.userId);
      if (user) {
        sendTemplatedEmail('order_status_update', user.email, {
          userName: user.name,
          orderId: order.id.toString(),
          oldStatus,
          newStatus: status,
          totalAmount: `$${order.totalAmount.toFixed(2)}`,
          frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
        }).catch(() => {});
      }
    }

    return sendSuccess(res, 'Order updated', { order });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return sendError(res, 'Session ID is required', 400);
    }

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err) {
      console.error('Stripe session retrieve error:', err.message);
      return sendError(res, 'Invalid session ID', 400);
    }

    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return sendError(res, 'No order associated with this session', 400);
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    console.log(`Payment verification for Order #${orderId}: Stripe status = ${session.payment_status}`);

    if (session.payment_status === 'paid' && order.paymentStatus !== 'Paid') {
      await order.update({
        paymentStatus: 'Paid',
        stripePaymentIntentId: session.payment_intent,
        status: 'Processing',
      });

      console.log(`Order #${orderId} payment status updated to Paid`);

      const io = getIO();
      io.emit('order-updated', order);

      await Notification.create({
        title: 'Payment Received',
        message: `Payment for Order #${order.id} has been received`,
        type: 'success',
      });

      const user = await User.findByPk(order.userId);
      if (user) {
        const fullOrder = await Order.findByPk(order.id, {
          include: [{
            model: OrderItem,
            as: 'items',
            include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }],
          }],
        });

        const itemsHtml = fullOrder.items.map(item => `
          <div style="padding:8px;border-bottom:1px solid #eee;">
            <span>${item.product.name}</span>
            <span style="float:right;">x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('');

        sendTemplatedEmail('payment_success', user.email, {
          userName: user.name,
          orderId: fullOrder.id.toString(),
          amount: `$${fullOrder.totalAmount.toFixed(2)}`,
          paymentMethod: 'Stripe',
        }).catch(err => console.error('Payment success email error:', err.message));

        sendTemplatedEmail('place_order', user.email, {
          userName: user.name,
          orderId: fullOrder.id.toString(),
          orderDate: new Date(fullOrder.createdAt).toLocaleDateString(),
          items: itemsHtml,
          totalAmount: `$${fullOrder.totalAmount.toFixed(2)}`,
          paymentStatus: 'Paid',
          frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
        }).catch(err => console.error('Place order email error:', err.message));
      }
    } else if (session.payment_status === 'unpaid') {
      if (order.paymentStatus !== 'Failed') {
        await order.update({ paymentStatus: 'Failed' });
        console.log(`Order #${orderId} payment status updated to Failed`);
      }
    }

    const fullOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }],
      }],
    });

    return sendSuccess(res, 'Payment verified', {
      order: fullOrder,
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    next(error);
  }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  console.log('Webhook received');

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('event',event);
    
    console.log(`Webhook event type: ${event.type}`);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    console.log(`Checkout session completed for Order #${orderId}`);

    if (orderId) {
      const order = await Order.findByPk(orderId);
      if (order) {
        await order.update({
          paymentStatus: 'Paid',
          stripePaymentIntentId: session.payment_intent,
           status: session.payment_status === 'paid' ? 'Paid' : 'Pending',
        });

        console.log(`Order #${orderId} updated to Paid via webhook`);

        const io = getIO();
        io.emit('order-updated', order);

        await Notification.create({
          title: 'Payment Received',
          message: `Payment for Order #${order.id} has been received`,
          type: 'success',
        });

        const user = await User.findByPk(order.userId);
        if (user) {
          const fullOrder = await Order.findByPk(order.id, {
            include: [{
              model: OrderItem,
              as: 'items',
              include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }],
            }],
          });

          const itemsHtml = fullOrder.items.map(item => `
            <div style="padding:8px;border-bottom:1px solid #eee;">
              <span>${item.product.name}</span>
              <span style="float:right;">x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('');

          sendTemplatedEmail('payment_success', user.email, {
            userName: user.name,
            orderId: fullOrder.id.toString(),
            amount: `$${fullOrder.totalAmount.toFixed(2)}`,
            paymentMethod: 'Stripe',
          }).catch(err => console.error('Payment success email error:', err.message));

          sendTemplatedEmail('place_order', user.email, {
            userName: user.name,
            orderId: fullOrder.id.toString(),
            orderDate: new Date(fullOrder.createdAt).toLocaleDateString(),
            items: itemsHtml,
            totalAmount: `$${fullOrder.totalAmount.toFixed(2)}`,
            paymentStatus: 'Paid',
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
          }).catch(err => console.error('Place order email error:', err.message));
        }
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    console.log(`Checkout session expired for Order #${orderId}`);

    if (orderId) {
      const order = await Order.findByPk(orderId);
      if (order && order.paymentStatus === 'Pending') {
        await order.update({ paymentStatus: 'Failed' });

        for (const item of order.items || []) {
          const product = await Product.findByPk(item.productId);
          if (product) {
            await product.update({ stock: product.stock + item.quantity });
          }
        }
      }
    }
  }

  res.json({ received: true });
};
