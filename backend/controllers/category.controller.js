const { Category, Product } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product, as: 'products', attributes: ['id'] }],
    });

    const categoriesWithCount = categories.map((cat) => ({
      ...cat.toJSON(),
      productCount: cat.products.length,
    }));

    return sendSuccess(res, 'Categories retrieved', { categories: categoriesWithCount });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Product, as: 'products', attributes: ['id', 'name', 'price', 'image'] }],
    });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    const result = category.toJSON();
    result.productCount = result.products.length;

    return sendSuccess(res, 'Category retrieved', { category: result });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return sendError(res, 'Category with this name already exists', 409);
    }

    const category = await Category.create({ name, description });

    return sendSuccess(res, 'Category created', { category }, 201);
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    const { name, description } = req.body;

    if (name && name !== category.name) {
      const existing = await Category.findOne({ where: { name } });
      if (existing) {
        return sendError(res, 'Category with this name already exists', 409);
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    await category.update(updateData);

    return sendSuccess(res, 'Category updated', { category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Product, as: 'products' }],
    });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    if (category.products.length > 0) {
      return sendError(res, 'Cannot delete category with associated products', 400);
    }

    await category.destroy();

    return sendSuccess(res, 'Category deleted');
  } catch (error) {
    next(error);
  }
};
