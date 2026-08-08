require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

const mapping = {
  'Classic Hand-Tossed': 'hand tossed.png',
  'Stuffed Crust': 'stuffed crust.png',
  'Classic Tomato': 'tomato sauce.png',
  'Peri Peri': 'peri peri.png',
  'BBQ': 'bbq.png',
  'Alfredo (White Sauce)': 'alferedo.png',
  'Mozzarella': 'plain.png',
  'Onion': 'onion.png',
  'Corn': 'corn.png',
  'Olives': 'olives.png',
  'Jalapeno': 'jalepeno.png',
  'Tomato': 'tomato.png',
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    const items = await Inventory.find({});

    for (const item of items) {
      const fileName = mapping[item.name];
      if (fileName) {
        item.previewLayer = `/assets/layers/${fileName}`;
        await item.save();
        console.log(`✅ Updated ${item.name} -> ${item.previewLayer}`);
      } else {
        console.log(`⚠️ No image mapping for ${item.name}, skipping.`);
      }
    }

    console.log('\nLayer update complete! Restart your server if needed.');
  } catch (err) {
    console.error('Error during update:', err);
  } finally {
    process.exit(0);
  }
};

run();
