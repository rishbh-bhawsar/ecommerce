const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, changePasswordValidation } = require('../validators/auth.validator');

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.post('/change-password', authMiddleware, changePasswordValidation, authController.changePassword);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password', authMiddleware, resetPasswordValidation, authController.resetPassword);

module.exports = router;
