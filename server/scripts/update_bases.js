require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

const baseMapping = {
  'Thin Crust': 'plain.png',
  'Whole Wheat': 'glutten free.png',
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    for (const [name, fileName] of Object.entries(baseMapping)) {
      await Inventory.updateOne(
        { name: name },
        { previewLayer: `/assets/layers/${fileName}` }
      );
      console.log(`✅ Updated ${name} -> /assets/layers/${fileName}`);
    }

    console.log('\nBase update complete!');
  } catch (err) {
    console.error('Error during update:', err);
  } finally {
    process.exit(0);
  }
};

run();
