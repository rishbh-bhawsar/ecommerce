const { Cart, CartItem, Product } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image', 'stock'] }],
      }],
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
      cart = await Cart.findByPk(cart.id, {
        include: [{
          model: CartItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image', 'stock'] }],
        }],
      });
    }

    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + parseFloat(item.product.price) * item.quantity;
    }, 0);

    return sendSuccess(res, 'Cart retrieved', { cart, totalAmount });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    console.log('req.user.id',req.user.id);
    
    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      return sendError(res, 'Product not found', 404);
    }

    if (product.stock < quantity) {
      return sendError(res, 'Insufficient stock', 400);
    }

    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }

    const existingItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return sendError(res, 'Insufficient stock', 400);
      }
      await existingItem.update({ quantity: newQuantity });
    } else {
      await CartItem.create({ cartId: cart.id, productId, quantity });
    }

    const updatedCart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image', 'stock'] }],
      }],
    });

    return sendSuccess(res, 'Item added to cart', { cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return sendError(res, 'Cart not found', 404);
    }

    const cartItem = await CartItem.findOne({
      where: { id: req.params.id, cartId: cart.id },
      include: [{ model: Product, as: 'product' }],
    });

    if (!cartItem) {
      return sendError(res, 'Cart item not found', 404);
    }

    if (quantity > cartItem.product.stock) {
      return sendError(res, 'Insufficient stock', 400);
    }

    await cartItem.update({ quantity });

    const updatedCart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image', 'stock'] }],
      }],
    });

    return sendSuccess(res, 'Cart updated', { cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return sendError(res, 'Cart not found', 404);
    }

    const cartItem = await CartItem.findOne({
      where: { id: req.params.id, cartId: cart.id },
    });

    if (!cartItem) {
      return sendError(res, 'Cart item not found', 404);
    }

    await cartItem.destroy();

    return sendSuccess(res, 'Item removed from cart');
  } catch (error) {
    next(error);
  }
};
