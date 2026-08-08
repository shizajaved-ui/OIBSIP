require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Fix Tomato Sauce
  await Inventory.updateOne(
    { name: 'Classic Tomato', category: 'sauce' },
    { previewLayer: '/assets/layers/tomato sauce.png' }
  );

  // Fix Tomato Vegetable
  await Inventory.updateOne(
    { name: 'Tomato', category: 'vegetable' },
    { previewLayer: '/assets/layers/tomato.png' }
  );

  console.log('Tomato mappings fixed!');
  process.exit(0);
};

run();
