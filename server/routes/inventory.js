const express = require('express');
const Inventory = require('../models/Inventory');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { isCloudinaryConfigured, uploadBufferToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// @route  POST /api/inventory/:id/menu-visual — admin: upload professional photo
router.post('/:id/menu-visual', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    const imageUrl = isCloudinaryConfigured ? await uploadBufferToCloudinary(req.file.buffer) : `/uploads/${req.file.filename}`;
    const item = await Inventory.findByIdAndUpdate(req.params.id, { menuVisual: imageUrl }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Menu visual upload failed', error: err.message });
  }
});

// @route  POST /api/inventory/:id/inventory-card — admin: upload dough card photo
router.post('/:id/inventory-card', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    const imageUrl = isCloudinaryConfigured ? await uploadBufferToCloudinary(req.file.buffer) : `/uploads/${req.file.filename}`;
    const item = await Inventory.findByIdAndUpdate(req.params.id, { inventoryCard: imageUrl }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Inventory card upload failed', error: err.message });
  }
});

// @route  POST /api/inventory/:id/builder-image — admin: upload dough/crust photo for the visualizer
router.post('/:id/builder-image', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    const imageUrl = isCloudinaryConfigured ? await uploadBufferToCloudinary(req.file.buffer) : `/uploads/${req.file.filename}`;
    const item = await Inventory.findByIdAndUpdate(req.params.id, { builderImage: imageUrl }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Builder image upload failed', error: err.message });
  }
});

// @route  GET /api/inventory  — public, used by the pizza builder to show available options
router.get('/', async (req, res) => {
  try {
    const items = await Inventory.find().sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch inventory', error: err.message });
  }
});

// @route  POST /api/inventory  — admin: add new item
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create item', error: err.message });
  }
});

// @route  PUT /api/inventory/:id  — admin: manual stock/price update
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update item', error: err.message });
  }
});

// @route  DELETE /api/inventory/:id  — admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete item', error: err.message });
  }
});

module.exports = router;
