require('dotenv').config();
const mongoose = require('mongoose');
const Cart = require('./models/Cart');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');
    await Cart.deleteMany({});
    console.log('✅ ALL CARTS CLEARED. This should resolve your schema mismatch issues.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
};

run();
