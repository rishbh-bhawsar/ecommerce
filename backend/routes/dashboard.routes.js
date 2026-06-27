const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

router.get('/stats', authMiddleware, authorize(['admin']), dashboardController.getStats);

module.exports = router;
