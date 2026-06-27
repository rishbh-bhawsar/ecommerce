const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailTemplate = sequelize.define('EmailTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  event: {
    type: DataTypes.ENUM(
      'register',
      'login',
      'logout',
      'reset_password',
      'update_profile',
      'place_order',
      'cancel_order',
      'order_status_update',
      'payment_success',
      'payment_failed',
      'welcome',
      'subscription_created',
      'subscription_canceled',
      'low_stock',
      'custom'
    ),
    allowNull: false,
    unique: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  htmlTemplate: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  variables: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON array of available variables like ["userName", "orderId"]',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'email_templates',
});

module.exports = EmailTemplate;
