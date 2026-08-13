require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

const veggieMapping = {
  'Mushroom': 'mushroom.png',
  'Onion': 'onion.png',
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    for (const [name, fileName] of Object.entries(veggieMapping)) {
      const result = await Inventory.updateOne(
        { name: name },
        { previewLayer: `/assets/layers/${fileName}` }
      );
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${name} -> /assets/layers/${fileName}`);
      } else {
        console.log(`⚠️ No changes for ${name} (might already be set or not found).`);
      }
    }

    console.log('\nVeggie update complete!');
  } catch (err) {
    console.error('Error during update:', err);
  } finally {
    process.exit(0);
  }
};

run();
