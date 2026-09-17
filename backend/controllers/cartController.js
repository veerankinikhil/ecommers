import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

// @desc    Get Customer Cart
// @route   GET /api/cart
// @access  Private (Customer)
export const getCustomerCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customerId: req.user._id }).populate('items.productId');
    if (!cart) {
      cart = await Cart.create({ customerId: req.user._id, items: [] });
    }
    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add Item to Cart / Update Quantity
// @route   POST /api/cart
// @access  Private (Customer)
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    let cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) {
      cart = new Cart({ customerId: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += qty;
    } else {
      cart.items.push({
        productId: product._id,
        sellerId: product.sellerId,
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
        quantity: qty
      });
    }

    // Recalculate totals
    cart.subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    cart.discountAmount = cart.subtotal > 2000 ? Math.round(cart.subtotal * 0.1) : 0;
    cart.taxAmount = cart.subtotal > 0 ? 199 : 0;
    cart.totalAmount = cart.subtotal - cart.discountAmount + cart.taxAmount;

    await cart.save();
    res.json({ success: true, message: 'Item added to cart', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Item Quantity in Cart
// @route   PUT /api/cart/:itemId
// @access  Private (Customer)
export const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    let cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

    if (quantity <= 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }

    cart.subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    cart.discountAmount = cart.subtotal > 2000 ? Math.round(cart.subtotal * 0.1) : 0;
    cart.taxAmount = cart.subtotal > 0 ? 199 : 0;
    cart.totalAmount = cart.subtotal - cart.discountAmount + cart.taxAmount;

    await cart.save();
    res.json({ success: true, message: 'Cart quantity updated', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove Item from Cart
// @route   DELETE /api/cart/:itemId
// @access  Private (Customer)
export const removeFromCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);

    cart.subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    cart.discountAmount = cart.subtotal > 2000 ? Math.round(cart.subtotal * 0.1) : 0;
    cart.taxAmount = cart.subtotal > 0 ? 199 : 0;
    cart.totalAmount = cart.subtotal - cart.discountAmount + cart.taxAmount;

    await cart.save();
    res.json({ success: true, message: 'Item removed from cart', cart });
  } catch (error) {
    next(error);
  }
};
