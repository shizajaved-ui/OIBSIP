require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const items = await Inventory.find({});
  console.log('Current Inventory Mappings:');
  items.forEach(item => {
    console.log(`[${item.category}] ${item.name} -> previewLayer: ${item.previewLayer}`);
  });
  process.exit(0);
};

run();
