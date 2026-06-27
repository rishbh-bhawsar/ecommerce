const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const { productValidation } = require('../validators/product.validator');
const validate = require('../middlewares/validate.middleware');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

router.post('/', authMiddleware, authorize(['admin']), upload.single('image'), productValidation, validate, productController.createProduct);
router.put('/:id', authMiddleware, authorize(['admin']), upload.single('image'), productValidation, validate, productController.updateProduct);
router.delete('/:id', authMiddleware, authorize(['admin']), productController.deleteProduct);

module.exports = router;
