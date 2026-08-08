require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');
const fs = require('fs');
const path = require('path');

const layersDir = path.join(__dirname, '../client/public/assets/layers');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    const files = fs.readdirSync(layersDir);
    const items = await Inventory.find({});

    for (const item of items) {
      // Try to find a match in the files
      const cleanName = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const match = files.find(f => {
          const cleanFile = f.toLowerCase().replace(/[^a-z0-9]/g, '').replace('png', '');
          return cleanFile === cleanName || cleanName.includes(cleanFile) || cleanFile.includes(cleanName);
      });

      if (match) {
          item.previewLayer = `/assets/layers/${match}`;
          await item.save();
          console.log(`✅ Auto-mapped ${item.name} -> ${item.previewLayer}`);
      }
    }

    console.log('\nAuto-mapping complete!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
};

run();
