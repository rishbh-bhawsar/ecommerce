const { User } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { sendTemplatedEmail } = require('../services/emailTemplate.service');

exports.getUserCount = async (req, res, next) => {
  try {
    const count = await User.count({ where: { isActive: true } });
    return sendSuccess(res, 'User count retrieved', { count });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await User.findAndCountAll({
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return sendSuccess(res, 'Users retrieved', {
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, 'User retrieved', { user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const { name, email, role, isActive } = req.body;

    const fieldMap = {
      name: "Name",
      email: "Email",
      role: "Role",
      isActive: "Status",
    };

    const updateData = {};
    const updatedFields = [];

    Object.entries(fieldMap).forEach(([key, label]) => {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
        updatedFields.push(label);
      }
    });

    if (updatedFields.length === 0) {
      return sendSuccess(res, "No changes detected", { user });
    }

    await user.update(updateData);

    sendTemplatedEmail("update_profile", user.email, {
      userName: user.name,
      updatedFields: updatedFields.join(", "),
    }).catch(console.error);

    return sendSuccess(res, "User updated successfully", { user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.role === 'admin') {
      return sendError(res, 'Cannot delete admin user', 400);
    }

    await user.update({ isActive: false });
    return sendSuccess(res, 'User deactivated');
  } catch (error) {
    next(error);
  }
};
