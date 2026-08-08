const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['base', 'sauce', 'cheese', 'vegetable', 'thickness', 'size'],
      required: true,
    },
    stock: { type: Number, required: true, default: 100 },
    threshold: { type: Number, default: 20 },
    price: { type: Number, default: 0 }, // extra cost for this option, if any
    calories: { type: Number, default: 0 }, // calories for this option
    menuVisual: { type: String, default: '' }, // Strictly for the Menu Collection (Toppings shown)
    inventoryCard: { type: String, default: '' }, // Strictly for Inventory Buttons (Dough shown)
    builderImage: { type: String, default: '' }, // raw dough/crust visual for the builder
    previewLayer: { type: String, default: '' }, // transparent PNG for the live preview stack
    lowStockAlertSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
