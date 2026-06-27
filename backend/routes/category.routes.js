const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const { categoryValidation } = require('../validators/category.validator');
const validate = require('../middlewares/validate.middleware');

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

router.post('/', authMiddleware, authorize(['admin']), categoryValidation, validate, categoryController.createCategory);
router.put('/:id', authMiddleware, authorize(['admin']), categoryValidation, validate, categoryController.updateCategory);
router.delete('/:id', authMiddleware, authorize(['admin']), categoryController.deleteCategory);

module.exports = router;
