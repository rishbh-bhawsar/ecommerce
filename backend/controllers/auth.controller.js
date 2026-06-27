const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { User, Cart } = require('../models');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');
const { sendTemplatedEmail } = require('../services/emailTemplate.service');

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(res, 'Email already registered', 409);
    }

    const user = await User.create({ name, email, password, role: role || 'user' });
    await Cart.create({ userId: user.id });

    const token = generateToken({ id: user.id, role: user.role });

    sendTemplatedEmail('welcome', user.email, {
      userName: user.name,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
    }).catch(err => console.error('Welcome email error:', err.message));

    return sendSuccess(res, 'Registration successful', {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, 201);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const token = generateToken({ id: user.id, role: user.role });

    sendTemplatedEmail('login', user.email, {
      userName: user.name,
      loginTime: new Date().toLocaleString(),
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
      device: req.headers['user-agent'] || 'Unknown',
    }).catch(err => console.error('Login email error:', err.message));

    return sendSuccess(res, 'Login successful', {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Profile retrieved', { user: req.user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    if (currentPassword === newPassword) {
      return sendError(res, 'New password must be different from current password', 400);
    }

    await user.update({ password: newPassword });

    sendTemplatedEmail('update_profile', user.email, {
      userName: user.name,
      updatedFields: 'Password',
    }).catch(err => console.error('Change password email error:', err.message));

    return sendSuccess(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }

    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return sendError(res, 'No account found with this email', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await user.update({ resetToken, resetTokenExpiry });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`;

    sendTemplatedEmail('reset_password', user.email, {
      userName: user.name,
      resetUrl,
      expiryTime: '1 hour',
    }).catch(err => console.error('Reset password email error:', err.message));

    return sendSuccess(res, 'Password reset email sent');
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }

    const { password } = req.body;

    if (!req.user || !req.user.id) {
      return sendError(res, 'Unauthorized. Please login first.', 401);
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    console.log('Reset password successful for user:', user.email);

    await user.update({ password });

    sendTemplatedEmail('update_profile', user.email, {
      userName: user.name,
      updatedFields: 'Password',
    }).catch(err => console.error('Reset password email error:', err.message));

    return sendSuccess(res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};
