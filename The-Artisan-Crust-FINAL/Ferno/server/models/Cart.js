const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  base: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  sauce: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  cheese: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  vegetables: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }],
  quantity: { type: Number, default: 1, min: 1 },
  unitPrice: { type: Number, required: true }, // snapshot of price at add-time
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
