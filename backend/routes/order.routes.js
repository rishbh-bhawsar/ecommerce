const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const { orderValidation } = require('../validators/order.validator');

router.post('/checkout', authMiddleware, authorize(['user', 'admin']), orderValidation, orderController.createOrder);
router.post('/', authMiddleware, authorize(['user', 'admin']), orderValidation, orderController.createOrder);

router.get('/dashboard', authMiddleware, authorize(['user', 'admin']), orderController.getOrdersByRole);
router.get('/stats', authMiddleware, authorize(['user', 'admin']), orderController.getOrderStats);
router.get('/my-orders', authMiddleware, authorize(['user', 'admin']), orderController.getMyOrders);
router.get('/verify-payment/:sessionId', authMiddleware, authorize(['user', 'admin']), orderController.verifyPayment);

router.get('/', authMiddleware, authorize(['user', 'admin']), orderController.getAllOrders);
router.get('/all', authMiddleware, authorize(['admin']), orderController.getAllOrders);
router.put('/:id/status', authMiddleware, authorize(['admin']), orderController.updateOrderStatus);
router.put('/:id/cancel', authMiddleware, authorize(['user', 'admin']), orderController.cancelOrder);

module.exports = router;
