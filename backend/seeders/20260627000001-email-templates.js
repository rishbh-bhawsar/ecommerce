'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const templates = [
      {
        name: 'Welcome Email',
        event: 'welcome',
        subject: 'Welcome to E-Commerce, {{userName}}!',
        variables: JSON.stringify(['userName']),
        isActive: true,
        htmlTemplate: `
          <div style="text-align:center;margin-bottom:20px;">
            <div style="width:60px;height:60px;background-color:#4CAF50;border-radius:50%;margin:0 auto;line-height:60px;">
              <span style="color:#fff;font-size:30px;">👋</span>
            </div>
          </div>
          <h2 style="color:#333;margin-top:0;text-align:center;">Welcome to E-Commerce!</h2>
          <p style="color:#666;line-height:1.6;">Hi {{userName}},</p>
          <p style="color:#666;line-height:1.6;">Thank you for registering with us. We're excited to have you on board!</p>
          <p style="color:#666;line-height:1.6;">You can now start browsing our products and enjoy a seamless shopping experience.</p>
          <div style="text-align:center;margin:25px 0;">
            <a href="{{frontendUrl}}/products" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">Start Shopping</a>
          </div>
          <p style="color:#999;font-size:12px;margin-top:20px;">If you have any questions, feel free to contact our support team.</p>
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Login Notification',
        event: 'login',
        subject: 'Login Alert - New Login to Your Account',
        variables: JSON.stringify(['userName', 'loginTime', 'ipAddress', 'device']),
        isActive: true,
        htmlTemplate: `
          <div style="text-align:center;margin-bottom:20px;">
            <div style="width:60px;height:60px;background-color:#2196F3;border-radius:50%;margin:0 auto;line-height:60px;">
              <span style="color:#fff;font-size:30px;">🔐</span>
            </div>
          </div>
          <h2 style="color:#333;margin-top:0;text-align:center;">New Login Detected</h2>
          <p style="color:#666;line-height:1.6;">Hi {{userName}},</p>
          <p style="color:#666;line-height:1.6;">We noticed a new login to your account.</p>
          <div style="background-color:#f9f9f9;border-radius:8px;padding:15px;margin:20px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#666;padding:5px 0;">Time:</td>
                <td style="color:#333;text-align:right;padding:5px 0;">{{loginTime}}</td>
              </tr>
              <tr>
                <td style="color:#666;padding:5px 0;">IP Address:</td>
                <td style="color:#333;text-align:right;padding:5px 0;">{{ipAddress}}</td>
              </tr>
              <tr>
                <td style="color:#666;padding:5px 0;">Device:</td>
                <td style="color:#333;text-align:right;padding:5px 0;">{{device}}</td>
              </tr>
            </table>
          </div>
          <div style="background-color:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0;border-radius:4px;">
            <p style="color:#856404;margin:0;">If this wasn't you, please change your password immediately and contact support.</p>
          </div>
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Password Reset Request',
        event: 'reset_password',
        subject: 'Password Reset Request',
        variables: JSON.stringify(['userName', 'resetUrl', 'expiryTime']),
        isActive: true,
        htmlTemplate: `
          <div style="text-align:center;margin-bottom:20px;">
            <div style="width:60px;height:60px;background-color:#ff9800;border-radius:50%;margin:0 auto;line-height:60px;">
              <span style="color:#fff;font-size:30px;">🔑</span>
            </div>
          </div>
          <h2 style="color:#333;margin-top:0;text-align:center;">Password Reset Request</h2>
          <p style="color:#666;line-height:1.6;">Hi {{userName}},</p>
          <p style="color:#666;line-height:1.6;">We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="text-align:center;margin:25px 0;">
            <a href="{{resetUrl}}" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">Reset Password</a>
          </div>
          <p style="color:#999;font-size:12px;">This link will expire in {{expiryTime}}. If you didn't request this, please ignore this email.</p>
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Profile Updated',
        event: 'update_profile',
        subject: 'Your Profile Has Been Updated',
        variables: JSON.stringify(['userName', 'updatedFields']),
        isActive: true,
        htmlTemplate: `
          <div style="text-align:center;margin-bottom:20px;">
            <div style="width:60px;height:60px;background-color:#4CAF50;border-radius:50%;margin:0 auto;line-height:60px;">
              <span style="color:#fff;font-size:30px;">✓</span>
            </div>
          </div>
          <h2 style="color:#333;margin-top:0;text-align:center;">Profile Updated</h2>
          <p style="color:#666;line-height:1.6;">Hi {{userName}},</p>
          <p style="color:#666;line-height:1.6;">Your profile has been successfully updated.</p>
          <div style="background-color:#f9f9f9;border-radius:8px;padding:15px;margin:20px 0;">
            <p style="color:#333;font-weight:bold;margin:0 0 10px;">Updated Fields:</p>
            <p style="color:#666;margin:0;">{{updatedFields}}</p>
          </div>
          <div style="background-color:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0;border-radius:4px;">
            <p style="color:#856404;margin:0;">If you didn't make this change, please contact support immediately.</p>
          </div>
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Order Placed',
        event: 'place_order',
        subject: 'Order #{{orderId}} Confirmed',
        variables: JSON.stringify(['userName', 'orderId', 'orderDate', 'items', 'totalAmount', 'paymentStatus']),
        isActive: true,
        htmlTemplate: `
          <div style="text-align:center;margin-bottom:20px;">
            <div style="width:60px;height:60px;background-color:#4CAF50;border-radius:50%;margin:0 auto;line-height:60px;">
              <span style="color:#fff;font-size:30px;">🛒</span>
            </div>
          </div>
          <h2 style="color:#333;margin-top:0;text-align:center;">Order Placed Successfully!</h2>
          <p style="color:#666;line-height:1.6;text-align:center;">Hi {{userName}}, thank you for your order!</p>
          <div style="background-color:#f9f9f9;border-radius:8px;padding:15px;margin:20px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#666;padding:5px 0;">Order Number:</td>
                <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">#{{orderId}}</td>
              </tr>
              <tr>
                <td style="color:#666;padding:5px 0;">Order Date:</td>
                <td style="color:#333;text-align:right;padding:5px 0;">{{orderDate}}</td>
              </tr>
              <tr>
                <td style="color:#666;padding:5px 0;">Payment Status:</td>
                <td style="color:#4CAF50;font-weight:bold;text-align:right;padding:5px 0;">{{paymentStatus}}</td>
              </tr>
            </table>
          </div>
          <h3 style="color:#333;margin:20px 0 10px;">Order Items</h3>
          <div style="background-color:#f9f9f9;border-radius:8px;padding:15px;margin:10px 0;">
            {{items}}
          </div>
          <div style="background-color:#e8f5e9;border-radius:8px;padding:15px;margin:20px 0;text-align:right;">
            <span style="color:#2e7d32;font-size:18px;font-weight:bold;">Total: {{totalAmount}}</span>
          </div>
          <div style="text-align:center;margin:25px 0;">
            <a href="{{frontendUrl}}/orders/{{orderId}}" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">View Order Details</a>
          </div>
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Order Cancelled',
        event: 'cancel_order',
        subject: 'Order #{{orderId}} Cancelled',
        variables: JSON.stringify(['userName', 'orderId', 'cancelReason', 'refundInfo']),
        isActive: true,
        htmlTemplate: `
          <div style="text-align:center;margin-bottom:20px;">
            <div style="width:60px;height:60px;background-color:#f44336;border-radius:50%;margin:0 auto;line-height:60px;">
              <span style="color:#fff;font-size:30px;">✕</span>
            </div>
          </div>
          <h2 style="color:#333;margin-top:0;text-align:center;">Order Cancelled</h2>
          <p style="color:#666;line-height:1.6;">Hi {{userName}},</p>
          <p style="color:#666;line-height:1.6;">Your order <strong>#{{orderId}}</strong> has been cancelled.</p>
          <div style="background-color:#f9f9f9;border-radius:8px;padding:15px;margin:20px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#666;padding:5px 0;">Order Number:</td>
                <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">#{{orderId}}</td>
              </tr>
              <tr>
                <td style="color:#666;padding:5px 0;">Cancel Reason:</td>
                <td style="color:#333;text-align:right;padding:5px 0;">{{cancelReason}}</td>
              </tr>
            </table>
          </div>
          <div style="background-color:#e3f2fd;border-left:4px solid #2196F3;padding:15px;margin:20px 0;border-radius:4px;">
            <p style="color:#1565c0;margin:0;">{{refundInfo}}</p>
          </div>
          <p style="color:#666;line-height:1.6;">We're sorry to see you go. If you have any feedback, please let us know.</p>
          <div style="text-align:center;margin:25px 0;">
            <a href="{{frontendUrl}}/products" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">Continue Shopping</a>
          </div>
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Order Status Update',
        event: 'order_status_update',
        subject: 'Order #{{orderId}} Status: {{newStatus}}',
        variables: JSON.stringify(['userName', 'orderId', 'oldStatus', 'newStatus', 'totalAmount']),
        isActive: true,
        htmlTemplate: `
          <div style="text-align:center;margin-bottom:20px;">
            <div style="width:60px;height:60px;background-color:#3f51b5;border-radius:50%;margin:0 auto;line-height:60px;">
              <span style="color:#fff;font-size:30px;">📦</span>
            </div>
          </div>
          <h2 style="color:#333;margin-top:0;text-align:center;">Order Status Updated</h2>
          <p style="color:#666;line-height:1.6;text-align:center;">Hi {{userName}},</p>
          <div style="text-align:center;margin:20px 0;">
            <span style="background-color:#3f51b5;color:#fff;padding:10px 20px;border-radius:20px;font-weight:bold;font-size:16px;">{{newStatus}}</span>
          </div>
          <div style="background-color:#f9f9f9;border-radius:8px;padding:15px;margin:20px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#666;padding:5px 0;">Order Number:</td>
                <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">#{{orderId}}</td>
              </tr>
              <tr>
                <td style="color:#666;padding:5px 0;">Previous Status:</td>
                <td style="color:#999;text-align:right;padding:5px 0;">{{oldStatus}}</td>
              </tr>
              <tr>
                <td style="color:#666;padding:5px 0;">Current Status:</td>
                <td style="color:#3f51b5;font-weight:bold;text-align:right;padding:5px 0;">{{newStatus}}</td>
              </tr>
              <tr>
                <td style="color:#666;padding:5px 0;">Total Amount:</td>
                <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">{{totalAmount}}</td>
              </tr>
            </table>
          </div>
          <div style="text-align:center;margin:25px 0;">
            <a href="{{frontendUrl}}/orders/{{orderId}}" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">Track Your Order</a>
          </div>
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Payment Success',
        event: 'payment_success',
        subject: 'Payment Received - Order #{{orderId}}',
        variables: JSON.stringify(['userName', 'orderId', 'amount', 'paymentMethod']),
        isActive: true,
        htmlTemplate: `
          <div style="text-align:center;margin-bottom:20px;">
            <div style="width:60px;height:60px;background-color:#4CAF50;border-radius:50%;margin:0 auto;line-height:60px;">
              <span style="color:#fff;font-size:30px;">✓</span>
            </div>
          </div>
          <h2 style="color:#333;margin-top:0;text-align:center;">Payment Successful!</h2>
          <p style="color:#666;line-height:1.6;text-align:center;">Hi {{userName}},</p>
          <p style="color:#666;line-height:1.6;text-align:center;">Your payment has been received successfully.</p>
          <div style="background-color:#e8f5e9;border-radius:8px;padding:15px;margin:20px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#2e7d32;padding:5px 0;">Order Number:</td>
                <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">#{{orderId}}</td>
              </tr>
              <tr>
                <td style="color:#2e7d32;padding:5px 0;">Amount Paid:</td>
                <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">{{amount}}</td>
              </tr>
              <tr>
                <td style="color:#2e7d32;padding:5px 0;">Payment Method:</td>
                <td style="color:#333;text-align:right;padding:5px 0;">{{paymentMethod}}</td>
              </tr>
            </table>
          </div>
          <div style="text-align:center;margin:25px 0;">
            <a href="{{frontendUrl}}/orders/{{orderId}}" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">View Order</a>
          </div>
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Payment Failed',
        event: 'payment_failed',
        subject: 'Payment Failed - Order #{{orderId}}',
        variables: JSON.stringify(['userName', 'orderId', 'amount', 'failureReason']),
        isActive: true,
        htmlTemplate: `
          <div style="text-align:center;margin-bottom:20px;">
            <div style="width:60px;height:60px;background-color:#f44336;border-radius:50%;margin:0 auto;line-height:60px;">
              <span style="color:#fff;font-size:30px;">✕</span>
            </div>
          </div>
          <h2 style="color:#333;margin-top:0;text-align:center;">Payment Failed</h2>
          <p style="color:#666;line-height:1.6;">Hi {{userName}},</p>
          <p style="color:#666;line-height:1.6;">Unfortunately, your payment for order <strong>#{{orderId}}</strong> could not be processed.</p>
          <div style="background-color:#ffebee;border-radius:8px;padding:15px;margin:20px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#c62828;padding:5px 0;">Order Number:</td>
                <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">#{{orderId}}</td>
              </tr>
              <tr>
                <td style="color:#c62828;padding:5px 0;">Amount:</td>
                <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">{{amount}}</td>
              </tr>
              <tr>
                <td style="color:#c62828;padding:5px 0;">Reason:</td>
                <td style="color:#333;text-align:right;padding:5px 0;">{{failureReason}}</td>
              </tr>
            </table>
          </div>
          <p style="color:#666;line-height:1.6;">Please try again or use a different payment method.</p>
          <div style="text-align:center;margin:25px 0;">
            <a href="{{frontendUrl}}/checkout/retry/{{orderId}}" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">Retry Payment</a>
          </div>
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Subscription Created',
        event: 'subscription_created',
        subject: 'Subscription Confirmed - {{planName}}',
        variables: JSON.stringify(['userName', 'planName', 'amount', 'interval', 'nextBillingDate']),
        isActive: true,
        htmlTemplate: `
          <div style="text-align:center;margin-bottom:20px;">
            <div style="width:60px;height:60px;background-color:#9C27B0;border-radius:50%;margin:0 auto;line-height:60px;">
              <span style="color:#fff;font-size:30px;">⭐</span>
            </div>
          </div>
          <h2 style="color:#333;margin-top:0;text-align:center;">Subscription Activated!</h2>
          <p style="color:#666;line-height:1.6;">Hi {{userName}},</p>
          <p style="color:#666;line-height:1.6;">Your subscription to <strong>{{planName}}</strong> has been activated successfully.</p>
          <div style="background-color:#f3e5f5;border-radius:8px;padding:15px;margin:20px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#666;padding:5px 0;">Plan:</td>
                <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">{{planName}}</td>
              </tr>
              <tr>
                <td style="color:#666;padding:5px 0;">Amount:</td>
                <td style="color:#333;font-weight:bold;text-align:right;padding:5px 0;">{{amount}} / {{interval}}</td>
              </tr>
              <tr>
                <td style="color:#666;padding:5px 0;">Next Billing:</td>
                <td style="color:#333;text-align:right;padding:5px 0;">{{nextBillingDate}}</td>
              </tr>
            </table>
          </div>
          <div style="text-align:center;margin:25px 0;">
            <a href="{{frontendUrl}}/subscriptions" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">Manage Subscription</a>
          </div>
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Subscription Cancelled',
        event: 'subscription_canceled',
        subject: 'Subscription Cancelled',
        variables: JSON.stringify(['userName', 'planName', 'endDate']),
        isActive: true,
        htmlTemplate: `
          <div style="text-align:center;margin-bottom:20px;">
            <div style="width:60px;height:60px;background-color:#9E9E9E;border-radius:50%;margin:0 auto;line-height:60px;">
              <span style="color:#fff;font-size:30px;">⏹</span>
            </div>
          </div>
          <h2 style="color:#333;margin-top:0;text-align:center;">Subscription Cancelled</h2>
          <p style="color:#666;line-height:1.6;">Hi {{userName}},</p>
          <p style="color:#666;line-height:1.6;">Your subscription to <strong>{{planName}}</strong> has been cancelled.</p>
          <p style="color:#666;line-height:1.6;">You will continue to have access until <strong>{{endDate}}</strong>.</p>
          <div style="text-align:center;margin:25px 0;">
            <a href="{{frontendUrl}}/subscriptions" style="display:inline-block;background-color:#3f51b5;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">Resubscribe</a>
          </div>
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('email_templates', templates, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('email_templates', null, {});
  },
};
