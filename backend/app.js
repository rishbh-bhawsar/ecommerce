const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const userRoutes = require('./routes/user.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const categoryRoutes = require('./routes/category.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const emailTemplateRoutes = require('./routes/emailTemplate.routes');
const errorHandler = require('./middlewares/error.middleware');
const { lowStockCheck } = require('./cron/stock-check.cron');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors());
app.use(morgan('dev'));
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), require('./controllers/order.controller').stripeWebhook);
app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), require('./controllers/subscription.controller').stripeWebhook);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/email-templates', emailTemplateRoutes);


app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

lowStockCheck();

app.use(errorHandler);

module.exports = app;
