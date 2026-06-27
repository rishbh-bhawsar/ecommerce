const { body } = require('express-validator');

const categoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 255 }).withMessage('Name must be under 255 characters'),
  body('description')
    .optional()
    .trim(),
];

module.exports = { categoryValidation };
