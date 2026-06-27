const { User, Product, Order } = require('../models');
const { Sequelize } = require('sequelize');
const { sendSuccess } = require('../utils/response');

exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count({ where: { isActive: true } });
    const totalProducts = await Product.count({ where: { isActive: true } });
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('totalAmount', {
      where: { paymentStatus: 'Paid' },
    }) || 0;

    return sendSuccess(res, 'Dashboard stats retrieved', {
      users: totalUsers,
      products: totalProducts,
      orders: totalOrders,
      revenue: parseFloat(totalRevenue.toFixed(2)),
    });
  } catch (error) {
    next(error);
  }
};
