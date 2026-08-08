const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/auth');
const { calculatePizzaPrice } = require('../utils/pricing');

const router = express.Router();

const isDemoMode =
  !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('xxxx');

const razorpay = isDemoMode
  ? null
  : new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

const populated = (cart) =>
  cart.populate('items.thickness items.size items.base items.sauce items.cheese items.vegetables');

// @route  GET /api/cart — the logged-in user's cart, fully populated
router.get('/', protect, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    await populated(cart);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cart', error: err.message });
  }
});

// @route  POST /api/cart/items — add a configured pizza to the cart
router.post('/items', protect, async (req, res) => {
  try {
    const { thickness, size, base, sauce, cheese, vegetables = [], quantity = 1 } = req.body;
    if (!thickness || !size || !base || !sauce || !cheese) {
      return res.status(400).json({ message: 'Thickness, size, base, sauce, and cheese are required' });
    }

    const unitPrice = await calculatePizzaPrice({ thickness, size, base, sauce, cheese, vegetables });
    const cart = await getOrCreateCart(req.user.id);
    cart.items.push({ thickness, size, base, sauce, cheese, vegetables, quantity, unitPrice });
    await cart.save();
    await populated(cart);
    res.status(201).json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to add item to cart' });
  }
});

// @route  PATCH /api/cart/items/:itemId — change a line item's quantity
router.patch('/items/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });
    item.quantity = quantity;
    await cart.save();
    await populated(cart);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update item', error: err.message });
  }
});

// @route  DELETE /api/cart/items/:itemId
router.delete('/items/:itemId', protect, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items.pull(req.params.itemId);
    await cart.save();
    await populated(cart);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove item', error: err.message });
  }
});

// @route  POST /api/cart/checkout/create-razorpay-order
// Creates one combined Razorpay order for the whole cart total.
router.post('/checkout/create-razorpay-order', protect, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    if (!cart.items.length) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }
    const amount = cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    if (isDemoMode) {
      return res.json({
        id: `demo_order_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: 'INR',
        demo: true,
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `cart_receipt_${Date.now()}`,
    });
    res.json(razorpayOrder);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create Razorpay order', error: err.message });
  }
});

// @route  POST /api/cart/checkout/confirm — verify payment, turn each cart
// line item into its own Order (so it shows up in Order History exactly
// like a single-pizza order does), then empty the cart.
router.post('/checkout/confirm', protect, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!isDemoMode) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');
      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    }

    const cart = await getOrCreateCart(req.user.id);
    if (!cart.items.length) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const orders = [];
    for (const item of cart.items) {
      const ids = [item.thickness, item.size, item.base, item.sauce, item.cheese, ...item.vegetables];
      await Inventory.updateMany({ _id: { $in: ids } }, { $inc: { stock: -item.quantity } });

      const order = await Order.create({
        user: req.user.id,
        thickness: item.thickness,
        size: item.size,
        base: item.base,
        sauce: item.sauce,
        cheese: item.cheese,
        vegetables: item.vegetables,
        totalAmount: item.unitPrice * item.quantity,
        paymentStatus: 'paid',
        razorpayOrderId,
        razorpayPaymentId,
        status: 'Order Received',
      });
      orders.push(order);
    }

    cart.items = [];
    await cart.save();

    res.status(201).json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to complete checkout', error: err.message });
  }
});

module.exports = router;
