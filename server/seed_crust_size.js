require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

const newItems = [
  // Thickness
  { name: 'Thin', category: 'thickness', stock: 100, threshold: 20, price: 0 },
  { name: 'Regular', category: 'thickness', stock: 100, threshold: 20, price: 0 },
  { name: 'Thick', category: 'thickness', stock: 100, threshold: 20, price: 30 },

  // Size
  { name: 'Small (8")', category: 'size', stock: 100, threshold: 20, price: 0 },
  { name: 'Regular (10")', category: 'size', stock: 100, threshold: 20, price: 50 },
  { name: 'Large (12")', category: 'size', stock: 100, threshold: 20, price: 100 },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    // Check if they already exist to avoid duplicates
    for (const item of newItems) {
        const existing = await Inventory.findOne({ name: item.name, category: item.category });
        if (!existing) {
            await Inventory.create(item);
            console.log(`✅ Added ${item.name} (${item.category})`);
        } else {
            console.log(`ℹ️ ${item.name} already exists, skipping.`);
        }
    }

    console.log('\nSeeding complete!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
};

run();
