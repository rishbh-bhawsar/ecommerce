const { Op } = require('sequelize');
const { Product, Category, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { getIO } = require('../config/socket');
const { Notification } = require('../models');
const { sendProductAddedEmail, sendProductDeletedEmail } = require('../utils/mailer');

exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = req.query.pageSize || 10,
      search = '',
      categoryId,
      category,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    } else if (category) {
      const numericId = parseInt(category);
      if (!isNaN(numericId)) {
        where.categoryId = numericId;
      } else {
        const foundCategory = await Category.findOne({ where: { name: category } });
        if (foundCategory) {
          where.categoryId = foundCategory.id;
        } else {
          return sendSuccess(res, 'Products retrieved', { products: [], pagination: { total: 0, page: parseInt(page), limit: parseInt(limit), totalPages: 0 } });
        }
      }
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    return sendSuccess(res, 'Products retrieved', {
      products: rows,
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

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    });

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    return sendSuccess(res, 'Product retrieved', { product });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    console.log('req body',req.body);
    
    const image = req.file ? req.file.filename : null;

    const product = await Product.create({
      name, description, price, stock, categoryId, image,
    });

    const io = getIO();
    io.emit('product-added', product);

    await Notification.create({
      title: 'New Product Added',
      message: `${product.name} has been added to the store`,
      type: 'info',
    });

    const admins = await User.findAll({ where: { role: 'admin', isActive: true } });
    for (const admin of admins) {
      sendProductAddedEmail(product, admin).catch(() => {});
    }

    return sendSuccess(res, 'Product created', { product }, 201);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    const { name, description, price, stock, categoryId, isActive } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (req.file) updateData.image = req.file.filename;

    await product.update(updateData);

    const io = getIO();
    io.emit('product-updated', product);

    return sendSuccess(res, 'Product updated', { product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    await product.update({ isActive: false });

    const io = getIO();
    io.emit('product-deleted', product.id);

    await Notification.create({
      title: 'Product Removed',
      message: `${product.name} has been deactivated`,
      type: 'warning',
    });

    const admins = await User.findAll({ where: { role: 'admin', isActive: true } });
    for (const admin of admins) {
      sendProductDeletedEmail(product, admin).catch(() => {});
    }

    return sendSuccess(res, 'Product deleted');
  } catch (error) {
    next(error);
  }
};
