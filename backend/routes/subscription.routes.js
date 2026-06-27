const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const { createPriceValidation, createSubscriptionValidation } = require('../validators/subscription.validator');
const {
  createCheckoutSession,
  createPrice,
  getAllPrices,
  getPriceById,
  updatePrice,
  deletePrice,
  createSubscription,
  getMySubscriptions,
  getAllSubscriptions,
  cancelSubscription,
  immediateCancelSubscription,
  getSubscriptionHistory
} = require('../controllers/subscription.controller');

const { stripeWebhook}  = require('../controllers/order.controller');

router.get('/prices', getAllPrices);
router.get('/prices/:id', getPriceById);

router.post('/checkout-session', authMiddleware, authorize(['admin']), createPriceValidation, createCheckoutSession);
router.post('/prices', authMiddleware, authorize(['admin']), createPriceValidation, createPrice);
router.put('/prices/:id', authMiddleware, authorize(['admin']), updatePrice);
router.delete('/prices/:id', authMiddleware, authorize(['admin']), deletePrice);

router.post('/', authMiddleware, createSubscriptionValidation, createSubscription);
router.get('/my', authMiddleware, getMySubscriptions);
router.get('/all', authMiddleware, authorize(['admin']), getAllSubscriptions);
router.get('/history', authMiddleware, getSubscriptionHistory);
router.put('/:id/cancel', authMiddleware, cancelSubscription);
router.put('/:id/immediate-cancel', authMiddleware, immediateCancelSubscription);
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);
module.exports = router;
