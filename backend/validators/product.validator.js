const { body } = require('express-validator');

const productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 255 }).withMessage('Name must be under 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock')
    .notEmpty().withMessage('Stock is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('categoryId')
    .notEmpty().withMessage('Category ID is required')
    .isInt().withMessage('Category ID must be an integer'),
];

module.exports = { productValidation };
