const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { protect, adminOnly } = require('../middleware/auth');
const { calculatePizzaPrice } = require('../utils/pricing');

const router = express.Router();

// Demo mode kicks in automatically when real Razorpay test keys aren't configured
// (e.g. Razorpay signup wasn't accessible). This is decided server-side only, from
// env vars the client can never see or influence — so it can't be spoofed.
const isDemoMode =
  !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('xxxx');

const razorpay = isDemoMode
  ? null
  : new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

// @route  POST /api/orders/create-razorpay-order
// Creates a Razorpay order for the given pizza selection. The price is
// always recomputed here from Inventory — never taken from the client — so
// the amount charged can't be manipulated by sending a fake total.
router.post('/create-razorpay-order', protect, async (req, res) => {
  try {
    const { base, sauce, cheese, vegetables } = req.body;
    const amount = await calculatePizzaPrice({ base, sauce, cheese, vegetables });

    if (isDemoMode) {
      // Return a fake order object shaped like Razorpay's real response, so the
      // frontend doesn't need separate demo-handling logic.
      return res.json({
        id: `demo_order_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: 'INR',
        demo: true,
      });
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    const razorpayOrder = await razorpay.orders.create(options);
    res.json(razorpayOrder);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create Razorpay order' });
  }
});

// @route  POST /api/orders  — confirm order after successful test-mode payment
router.post('/', protect, async (req, res) => {
  try {
    const {
      base, sauce, cheese, vegetables,
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
    } = req.body;

    // In demo mode (no real Razorpay keys configured) we skip signature
    // verification since the payment was simulated, not processed by Razorpay.
    if (!isDemoMode) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    }

    // Recompute the price server-side rather than trusting whatever
    // totalAmount the client sends — this is what actually gets stored.
    const totalAmount = await calculatePizzaPrice({ base, sauce, cheese, vegetables });

    // Decrement stock for each chosen item
    const ids = [base, sauce, cheese, ...(vegetables || [])];
    await Inventory.updateMany({ _id: { $in: ids } }, { $inc: { stock: -1 } });

    const order = await Order.create({
      user: req.user.id,
      base,
      sauce,
      cheese,
      vegetables,
      totalAmount,
      paymentStatus: 'paid',
      razorpayOrderId,
      razorpayPaymentId,
      status: 'Order Received',
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to place order' });
  }
});

// @route  GET /api/orders/my — logged-in user's orders (for dashboard polling)
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('base sauce cheese vegetables')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

// @route  GET /api/orders — admin: all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('base sauce cheese vegetables')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

// @route  PUT /api/orders/:id/status — admin: update order status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
});

// @route  DELETE /api/orders — admin: delete all orders (clear history)
router.delete('/', protect, adminOnly, async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ message: 'All orders removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear orders', error: err.message });
  }
});

// @route  DELETE /api/orders/:id — admin: delete a specific order
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete order', error: err.message });
  }
});

module.exports = router;
