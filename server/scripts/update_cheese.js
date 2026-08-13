require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

const cheeseMapping = {
  'Mozzarella': 'mozzerella.png',
  'Cheddar Blend': 'chedder blend.png',
  'Vegan Cheese': 'vegan.png',
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    for (const [name, fileName] of Object.entries(cheeseMapping)) {
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

    console.log('\nCheese update complete!');
  } catch (err) {
    console.error('Error during update:', err);
  } finally {
    process.exit(0);
  }
};

run();
