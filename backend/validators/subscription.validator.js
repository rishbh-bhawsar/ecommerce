const { body } = require('express-validator');

const createPriceValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Price name is required')
    .isLength({ max: 255 }).withMessage('Name must be under 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('interval')
    .notEmpty().withMessage('Interval is required')
    .isIn(['day', 'week', 'month', 'year']).withMessage('Invalid interval'),
  body('intervalCount')
    .optional()
    .isInt({ min: 1 }).withMessage('Interval count must be at least 1'),
];

const createSubscriptionValidation = [
  body('priceId')
    .notEmpty().withMessage('Price ID is required')
    .isInt().withMessage('Price ID must be an integer'),
  body('paymentMethodId')
    .notEmpty().withMessage('Payment method ID is required'),
];

module.exports = { createPriceValidation, createSubscriptionValidation };
