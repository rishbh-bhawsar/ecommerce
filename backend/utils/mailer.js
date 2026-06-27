const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error.message);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    if (!to) {
      console.error('Email error: No recipient address');
      return false;
    }

    const info = await transporter.sendMail({
      from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to} | Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    console.error('Full error:', error);
    return false;
  }
};

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background-color:#3f51b5;padding:20px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;">E-Commerce Store</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f4f4f4;padding:15px;text-align:center;font-size:12px;color:#999;">
              <p style="margin:0;">This is an automated email. Please do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const getAdminEmails = async () => {
  const { User } = require('../models');
  const admins = await User.findAll({ where: { role: 'admin', isActive: true }, attributes: ['email'] });
  return admins.map(a => a.email);
};

const sendWelcomeEmail = async (user) => {
  const html = baseTemplate(`
    <h2 style="color:#333;margin-top:0;">Welcome, ${user.name}!</h2>
    <p style="color:#666;line-height:1.6;">Your account has been created successfully.</p>
    <p style="color:#666;line-height:1.6;">You can now start browsing and shopping with us.</p>
    <a href="http://localhost:4200/login" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;margin-top:10px;">Start Shopping</a>
  `);
  await sendEmail(user.email, 'Welcome to E-Commerce!', html);
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = baseTemplate(`
    <h2 style="color:#333;margin-top:0;">Password Reset Request</h2>
    <p style="color:#666;line-height:1.6;">Hi ${user.name},</p>
    <p style="color:#666;line-height:1.6;">We received a request to reset your password. Click the button below to set a new password:</p>
    <a href="${resetUrl}" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;margin-top:10px;">Reset Password</a>
    <p style="color:#999;font-size:12px;margin-top:20px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
  `);
  await sendEmail(user.email, 'Password Reset Request', html);
};

const sendPasswordResetConfirmation = async (user) => {
  const html = baseTemplate(`
    <h2 style="color:#333;margin-top:0;">Password Updated</h2>
    <p style="color:#666;line-height:1.6;">Hi ${user.name},</p>
    <p style="color:#666;line-height:1.6;">Your password has been successfully updated. If you didn't make this change, please contact support immediately.</p>
  `);
  await sendEmail(user.email, 'Password Updated Successfully', html);
};

const sendProductAddedEmail = async (product, admin) => {
  const html = baseTemplate(`
    <h2 style="color:#333;margin-top:0;">New Product Added</h2>
    <p style="color:#666;line-height:1.6;">A new product has been added to the store:</p>
    <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #eee;border-radius:4px;margin:15px 0;">
      <tr><td style="font-weight:bold;color:#333;">Name</td><td style="color:#666;">${product.name}</td></tr>
      <tr><td style="font-weight:bold;color:#333;">Price</td><td style="color:#666;">$${product.price}</td></tr>
      <tr><td style="font-weight:bold;color:#333;">Stock</td><td style="color:#666;">${product.stock}</td></tr>
    </table>
  `);
  await sendEmail(admin.email, `New Product Added: ${product.name}`, html);
};

const sendProductDeletedEmail = async (product, admin) => {
  const html = baseTemplate(`
    <h2 style="color:#333;margin-top:0;">Product Removed</h2>
    <p style="color:#666;line-height:1.6;">A product has been deactivated from the store:</p>
    <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #eee;border-radius:4px;margin:15px 0;">
      <tr><td style="font-weight:bold;color:#333;">Name</td><td style="color:#666;">${product.name}</td></tr>
      <tr><td style="font-weight:bold;color:#333;">Price</td><td style="color:#666;">$${product.price}</td></tr>
    </table>
  `);
  await sendEmail(admin.email, `Product Removed: ${product.name}`, html);
};

const sendOrderConfirmation = async (user, order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;color:#666;">
        ${item.product.image ? `<img src="${item.product.image}" alt="${item.product.name}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;margin-right:10px;vertical-align:middle;">` : ''}
        ${item.product.name}
      </td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;color:#666;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;color:#666;text-align:right;">$${parseFloat(item.price).toFixed(2)}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;color:#333;text-align:right;font-weight:bold;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="width:60px;height:60px;background-color:#4CAF50;border-radius:50%;margin:0 auto;line-height:60px;">
        <span style="color:#fff;font-size:30px;">✓</span>
      </div>
    </div>
    <h2 style="color:#333;margin-top:0;text-align:center;">Payment Successful!</h2>
    <p style="color:#666;line-height:1.6;text-align:center;">Hi ${user.name}, thank you for your order!</p>
    
    <div style="background-color:#f9f9f9;border-radius:8px;padding:15px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#666;padding:5px 0;">Order Number:</td>
          <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">#${order.id}</td>
        </tr>
        <tr>
          <td style="color:#666;padding:5px 0;">Order Date:</td>
          <td style="color:#333;text-align:right;padding:5px 0;">${orderDate}</td>
        </tr>
        <tr>
          <td style="color:#666;padding:5px 0;">Payment Status:</td>
          <td style="color:#4CAF50;font-weight:bold;text-align:right;padding:5px 0;">${order.paymentStatus}</td>
        </tr>
        <tr>
          <td style="color:#666;padding:5px 0;">Order Status:</td>
          <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">${order.status}</td>
        </tr>
      </table>
    </div>

    <h3 style="color:#333;margin:20px 0 10px;">Order Items</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;border-collapse:collapse;">
      <tr style="background-color:#3f51b5;">
        <th style="text-align:left;padding:12px 8px;color:#fff;">Product</th>
        <th style="text-align:center;padding:12px 8px;color:#fff;">Qty</th>
        <th style="text-align:right;padding:12px 8px;color:#fff;">Price</th>
        <th style="text-align:right;padding:12px 8px;color:#fff;">Total</th>
      </tr>
      ${itemsHtml}
    </table>

    <div style="background-color:#f9f9f9;border-radius:8px;padding:15px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#666;padding:5px 0;">Subtotal:</td>
          <td style="color:#333;text-align:right;padding:5px 0;">$${order.totalAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="color:#666;padding:5px 0;">Shipping:</td>
          <td style="color:#333;text-align:right;padding:5px 0;">Free</td>
        </tr>
        <tr style="border-top:2px solid #3f51b5;">
          <td style="color:#333;padding:10px 0;font-size:18px;font-weight:bold;">Total:</td>
          <td style="color:#3f51b5;text-align:right;padding:10px 0;font-size:18px;font-weight:bold;">$${order.totalAmount.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin:25px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/orders/${order.id}" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">View Order Details</a>
    </div>

    <div style="background-color:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0;border-radius:4px;">
      <p style="color:#856404;margin:0;font-weight:bold;">What's Next?</p>
      <p style="color:#856404;margin:5px 0 0;">We'll send you an email when your order ships. You can track your order status anytime from your account.</p>
    </div>

    <p style="color:#999;font-size:12px;margin-top:20px;text-align:center;">Need help? Contact us at support@ecommerce.com</p>
  `);
  await sendEmail(user.email, `Order #${order.id} Confirmation - Payment Successful`, html);
};

const sendOrderNotificationToAdmin = async (user, order) => {
  const admins = await getAdminEmails();
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;color:#666;">
        ${item.product.image ? `<img src="${item.product.image}" alt="${item.product.name}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;margin-right:8px;vertical-align:middle;">` : ''}
        ${item.product.name}
      </td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;color:#666;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;color:#333;text-align:right;font-weight:bold;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="width:60px;height:60px;background-color:#ff9800;border-radius:50%;margin:0 auto;line-height:60px;">
        <span style="color:#fff;font-size:30px;">🛒</span>
      </div>
    </div>
    <h2 style="color:#333;margin-top:0;text-align:center;">New Order Received!</h2>
    
    <div style="background-color:#fff3cd;border-radius:8px;padding:15px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#856404;padding:5px 0;">Order Number:</td>
          <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">#${order.id}</td>
        </tr>
        <tr>
          <td style="color:#856404;padding:5px 0;">Order Date:</td>
          <td style="color:#333;text-align:right;padding:5px 0;">${orderDate}</td>
        </tr>
      </table>
    </div>

    <h3 style="color:#333;margin:20px 0 10px;">Customer Information</h3>
    <div style="background-color:#f9f9f9;border-radius:8px;padding:15px;margin:10px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#666;padding:5px 0;">Name:</td>
          <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">${user.name}</td>
        </tr>
        <tr>
          <td style="color:#666;padding:5px 0;">Email:</td>
          <td style="color:#333;text-align:right;padding:5px 0;">${user.email}</td>
        </tr>
        <tr>
          <td style="color:#666;padding:5px 0;">User ID:</td>
          <td style="color:#333;text-align:right;padding:5px 0;">#${user.id}</td>
        </tr>
      </table>
    </div>

    <h3 style="color:#333;margin:20px 0 10px;">Order Items</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;border-collapse:collapse;">
      <tr style="background-color:#3f51b5;">
        <th style="text-align:left;padding:12px 8px;color:#fff;">Product</th>
        <th style="text-align:center;padding:12px 8px;color:#fff;">Qty</th>
        <th style="text-align:right;padding:12px 8px;color:#fff;">Total</th>
      </tr>
      ${itemsHtml}
    </table>

    <div style="background-color:#e8f5e9;border-radius:8px;padding:15px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#2e7d32;padding:5px 0;">Payment Status:</td>
          <td style="color:#2e7d32;font-weight:bold;text-align:right;padding:5px 0;">✓ ${order.paymentStatus}</td>
        </tr>
        <tr>
          <td style="color:#2e7d32;padding:5px 0;font-size:18px;">Order Total:</td>
          <td style="color:#2e7d32;font-weight:bold;text-align:right;padding:5px 0;font-size:18px;">$${order.totalAmount.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin:25px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/admin/orders/${order.id}" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">View Order in Admin Panel</a>
    </div>
  `);

  for (const email of admins) {
    await sendEmail(email, `🛒 New Order #${order.id} - $${order.totalAmount.toFixed(2)} from ${user.name}`, html);
  }
};

const sendLowStockAlert = async (adminEmail, products) => {
  const productList = products.map(p => `<li style="padding:4px 0;color:#666;">${p.name} - Stock: ${p.stock}</li>`).join('');
  const html = baseTemplate(`
    <h2 style="color:#333;margin-top:0;">Low Stock Alert</h2>
    <p style="color:#666;line-height:1.6;">The following products are running low on stock:</p>
    <ul style="color:#666;">${productList}</ul>
  `);
  await sendEmail(adminEmail, 'Low Stock Alert - Action Required', html);
};

const sendSubscriptionConfirmation = async (user, subscription, price) => {
  const html = baseTemplate(`
    <h2 style="color:#333;margin-top:0;">Subscription Confirmed</h2>
    <p style="color:#666;line-height:1.6;">Hi ${user.name},</p>
    <p style="color:#666;line-height:1.6;">Your subscription to <strong>${price.name}</strong> has been activated successfully.</p>
    <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #eee;border-radius:4px;margin:15px 0;border-collapse:collapse;">
      <tr><td style="font-weight:bold;color:#333;">Plan</td><td style="color:#666;">${price.name}</td></tr>
      <tr><td style="font-weight:bold;color:#333;">Amount</td><td style="color:#666;">$${price.amount} / ${price.interval}</td></tr>
      <tr><td style="font-weight:bold;color:#333;">Status</td><td style="color:#666;">${subscription.status}</td></tr>
      <tr><td style="font-weight:bold;color:#333;">Next Billing</td><td style="color:#666;">${new Date(subscription.currentPeriodEnd).toLocaleDateString()}</td></tr>
    </table>
  `);
  await sendEmail(user.email, 'Subscription Confirmed', html);
};

const sendSubscriptionCancellation = async (user, subscription) => {
  const price = subscription.price;
  const html = baseTemplate(`
    <h2 style="color:#333;margin-top:0;">Subscription Canceled</h2>
    <p style="color:#666;line-height:1.6;">Hi ${user.name},</p>
    <p style="color:#666;line-height:1.6;">Your subscription to <strong>${price ? price.name : 'your plan'}</strong> has been canceled.</p>
    <p style="color:#666;line-height:1.6;">You will continue to have access until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}.</p>
  `);
  await sendEmail(user.email, 'Subscription Canceled', html);
};

const sendPaymentFailed = async (user, subscription) => {
  const html = baseTemplate(`
    <h2 style="color:#333;margin-top:0;">Payment Failed</h2>
    <p style="color:#666;line-height:1.6;">Hi ${user.name},</p>
    <p style="color:#666;line-height:1.6;">Your recent payment for your subscription has failed. Please update your payment method to avoid service interruption.</p>
    <a href="http://localhost:4200/subscription" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;margin-top:10px;">Update Payment Method</a>
  `);
  await sendEmail(user.email, 'Payment Failed - Action Required', html);
};

const sendSubscriptionRenewed = async (user, subscription, price) => {
  const html = baseTemplate(`
    <h2 style="color:#333;margin-top:0;">Subscription Renewed</h2>
    <p style="color:#666;line-height:1.6;">Hi ${user.name},</p>
    <p style="color:#666;line-height:1.6;">Your subscription to <strong>${price ? price.name : 'your plan'}</strong> has been renewed successfully.</p>
    <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #eee;border-radius:4px;margin:15px 0;border-collapse:collapse;">
      <tr><td style="font-weight:bold;color:#333;">Amount</td><td style="color:#666;">$${price ? price.amount : 'N/A'}</td></tr>
      <tr><td style="font-weight:bold;color:#333;">Next Billing</td><td style="color:#666;">${new Date(subscription.currentPeriodEnd).toLocaleDateString()}</td></tr>
    </table>
  `);
  await sendEmail(user.email, 'Subscription Renewed', html);
};

const sendAdminNewSubscription = async (user, subscription, price) => {
  const admins = await getAdminEmails();
  const html = baseTemplate(`
    <h2 style="color:#333;margin-top:0;">New Subscription</h2>
    <p style="color:#666;line-height:1.6;">A new subscription has been created.</p>
    <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #eee;border-radius:4px;margin:15px 0;border-collapse:collapse;">
      <tr><td style="font-weight:bold;color:#333;">Customer</td><td style="color:#666;">${user.name} (${user.email})</td></tr>
      <tr><td style="font-weight:bold;color:#333;">Plan</td><td style="color:#666;">${price.name}</td></tr>
      <tr><td style="font-weight:bold;color:#333;">Amount</td><td style="color:#666;">$${price.amount} / ${price.interval}</td></tr>
      <tr><td style="font-weight:bold;color:#333;">Status</td><td style="color:#666;">${subscription.status}</td></tr>
    </table>
  `);
  for (const email of admins) {
    await sendEmail(email, `New Subscription from ${user.name}`, html);
  }
};

const sendOrderStatusUpdate = async (user, order, oldStatus, newStatus) => {
  const statusColors = {
    'Pending': '#ffc107',
    'Processing': '#2196F3',
    'Shipped': '#9C27B0',
    'Delivered': '#4CAF50',
    'Cancelled': '#f44336',
  };

  const statusMessages = {
    'Processing': 'Your order is being prepared.',
    'Shipped': 'Your order has been shipped and is on its way!',
    'Delivered': 'Your order has been delivered. We hope you enjoy your purchase!',
    'Cancelled': 'Your order has been cancelled.',
  };

  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="width:60px;height:60px;background-color:${statusColors[newStatus] || '#3f51b5'};border-radius:50%;margin:0 auto;line-height:60px;">
        <span style="color:#fff;font-size:24px;">📦</span>
      </div>
    </div>
    <h2 style="color:#333;margin-top:0;text-align:center;">Order Status Updated</h2>
    <p style="color:#666;line-height:1.6;text-align:center;">Hi ${user.name},</p>
    
    <div style="text-align:center;margin:20px 0;">
      <span style="background-color:${statusColors[newStatus] || '#3f51b5'};color:#fff;padding:10px 20px;border-radius:20px;font-weight:bold;font-size:16px;">${newStatus}</span>
    </div>

    <p style="color:#666;line-height:1.6;text-align:center;">${statusMessages[newStatus] || 'Your order status has been updated.'}</p>

    <div style="background-color:#f9f9f9;border-radius:8px;padding:15px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#666;padding:5px 0;">Order Number:</td>
          <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">#${order.id}</td>
        </tr>
        <tr>
          <td style="color:#666;padding:5px 0;">Previous Status:</td>
          <td style="color:#999;text-align:right;padding:5px 0;">${oldStatus}</td>
        </tr>
        <tr>
          <td style="color:#666;padding:5px 0;">Current Status:</td>
          <td style="color:${statusColors[newStatus]};font-weight:bold;text-align:right;padding:5px 0;">${newStatus}</td>
        </tr>
        <tr>
          <td style="color:#666;padding:5px 0;">Total Amount:</td>
          <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">$${order.totalAmount.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin:25px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/orders/${order.id}" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">Track Your Order</a>
    </div>

    <p style="color:#999;font-size:12px;margin-top:20px;text-align:center;">Questions? Contact us at support@ecommerce.com</p>
  `);
  await sendEmail(user.email, `Order #${order.id} Status: ${newStatus}`, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
  sendProductAddedEmail,
  sendProductDeletedEmail,
  sendOrderConfirmation,
  sendOrderNotificationToAdmin,
  sendOrderStatusUpdate,
  sendLowStockAlert,
  sendSubscriptionConfirmation,
  sendSubscriptionCancellation,
  sendPaymentFailed,
  sendSubscriptionRenewed,
  sendAdminNewSubscription,
};
