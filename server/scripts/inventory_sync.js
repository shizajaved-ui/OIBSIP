require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');

const mapping = {
  // Bases
  'Classic Hand-Tossed': 'hand tossed.png',
  'Thin Crust': 'plain.png',
  'Stuffed Crust': 'stuffed crust.png',
  'Whole Wheat': 'glutten free.png',
  'Cheese Burst': 'plain.png',
  // Sauces
  'Classic Tomato': 'tomato sauce.png',
  'Peri Peri': 'peri peri.png',
  'BBQ': 'bbq.png',
  'Alfredo (White Sauce)': 'alferedo.png',
  // Cheese
  'Mozzarella': 'mozzerella.png',
  'Cheddar Blend': 'chedder blend.png',
  'Vegan Cheese': 'vegan.png',
  // Vegetables
  'Onion': 'onion.png',
  'Corn': 'corn.png',
  'Olives': 'olives.png',
  'Jalapeno': 'jalepeno.png',
  'Tomato': 'tomato.png',
  'Mushroom': 'mushroom.png',
  'Capsicum': 'capcicum.png',
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB. Syncing asset mappings...');

    const items = await Inventory.find({});
    let updatedCount = 0;

    for (const item of items) {
      const fileName = mapping[item.name];
      if (fileName) {
        item.previewLayer = `/assets/layers/${fileName}`;
        await item.save();
        updatedCount++;
        console.log(`✅ Linked: ${item.name} -> ${fileName}`);
      }
    }

    console.log(`\n✅ Sync complete. Updated ${updatedCount} items.`);
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
  } finally {
    process.exit(0);
  }
};

run();
