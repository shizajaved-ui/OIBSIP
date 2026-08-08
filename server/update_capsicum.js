require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    const result = await Inventory.updateOne(
      { name: 'Capsicum', category: 'vegetable' },
      { previewLayer: '/assets/layers/capcicum.png' }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Updated Capsicum -> /assets/layers/capcicum.png');
    } else {
      console.log('⚠️ Capsicum not found or already updated.');
    }

    console.log('\nUpdate complete!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
};

run();
