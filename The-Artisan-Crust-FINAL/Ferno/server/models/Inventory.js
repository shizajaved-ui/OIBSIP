const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['base', 'sauce', 'cheese', 'vegetable'],
      required: true,
    },
    stock: { type: Number, required: true, default: 100 },
    threshold: { type: Number, default: 20 },
    price: { type: Number, default: 0 }, // extra cost for this option, if any
    image: { type: String, default: '' },
    lowStockAlertSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
