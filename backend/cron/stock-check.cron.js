const cron = require('node-cron');
const { Product, Notification, User } = require('../models');
const { Op } = require('sequelize');
const { sendLowStockAlert } = require('../utils/mailer');

const lowStockCheck = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('Running daily stock check...');

      const lowStockProducts = await Product.findAll({
        where: {
          isActive: true,
          stock: { [Op.lt]: 10 },
        },
      });

      if (lowStockProducts.length > 0) {
        const productNames = lowStockProducts.map(p => p.name).join(', ');

        await Notification.create({
          title: 'Low Stock Alert',
          message: `${lowStockProducts.length} products are running low on stock: ${productNames}`,
          type: 'warning',
        });

        const admin = await User.findOne({ where: { role: 'admin' } });
        if (admin) {
          await sendLowStockAlert(admin.email, lowStockProducts);
        }

        console.log(`Low stock alert: ${lowStockProducts.length} products below threshold`);
      } else {
        console.log('All products have sufficient stock');
      }
    } catch (error) {
      console.error('Stock check cron error:', error);
    }
  });
};

module.exports = { lowStockCheck };
