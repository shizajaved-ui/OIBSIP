const express = require('express');
const Inventory = require('../models/Inventory');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { isCloudinaryConfigured, uploadBufferToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// @route  POST /api/inventory/:id/image  — admin: upload a photo for an inventory item
router.post('/:id/image', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });

    // Cloudinary configured: req.file.buffer holds the image in memory (never
    // touches local disk), uploaded straight to Cloudinary — persists across
    // redeploys. Not configured: fall back to the local path multer already
    // saved to disk (works locally, but won't survive a redeploy on hosts
    // without persistent disk, e.g. Render's free tier).
    const imageUrl = isCloudinaryConfigured
      ? await uploadBufferToCloudinary(req.file.buffer)
      : `/uploads/${req.file.filename}`;

    console.log('✅ Image processed successfully:', imageUrl);

    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { image: imageUrl },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    console.error('❌ IMAGE UPLOAD ERROR:', err);
    res.status(500).json({ message: 'Image upload failed', error: err.message });
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
