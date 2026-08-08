// Run with: node seed.js
// Populates inventory (5 bases, 5 sauces, cheeses, vegetables) and creates one admin user.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Inventory = require('./models/Inventory');
const User = require('./models/User');

const inventoryItems = [
  // Bases
  { name: 'Classic Hand-Tossed', category: 'base', stock: 100, threshold: 20, price: 0, previewLayer: '/assets/layers/hand tossed.png' },
  { name: 'Thin Crust', category: 'base', stock: 100, threshold: 20, price: 0, previewLayer: '/assets/layers/plain.png' },
  { name: 'Cheese Burst', category: 'base', stock: 100, threshold: 20, price: 60, previewLayer: '/assets/layers/plain.png' },
  { name: 'Whole Wheat', category: 'base', stock: 100, threshold: 20, price: 20, previewLayer: '/assets/layers/glutten free.png' },
  { name: 'Stuffed Crust', category: 'base', stock: 100, threshold: 20, price: 80, previewLayer: '/assets/layers/stuffed crust.png' },
  // Sauces
  { name: 'Classic Tomato', category: 'sauce', stock: 100, threshold: 20, price: 0, previewLayer: '/assets/layers/tomato sauce.png' },
  { name: 'Peri Peri', category: 'sauce', stock: 100, threshold: 20, price: 10, previewLayer: '/assets/layers/peri peri.png' },
  { name: 'BBQ', category: 'sauce', stock: 100, threshold: 20, price: 15, previewLayer: '/assets/layers/bbq.png' },
  { name: 'Alfredo (White Sauce)', category: 'sauce', stock: 100, threshold: 20, price: 20, previewLayer: '/assets/layers/alferedo.png' },
  { name: 'Pesto', category: 'sauce', stock: 100, threshold: 20, price: 25 },
  // Cheese
  { name: 'Mozzarella', category: 'cheese', stock: 100, threshold: 20, price: 0, previewLayer: '/assets/layers/mozzerella.png' },
  { name: 'Cheddar Blend', category: 'cheese', stock: 100, threshold: 20, price: 20, previewLayer: '/assets/layers/chedder blend.png' },
  { name: 'Vegan Cheese', category: 'cheese', stock: 100, threshold: 20, price: 30, previewLayer: '/assets/layers/vegan.png' },
  // Vegetables
  { name: 'Onion', category: 'vegetable', stock: 100, threshold: 20, price: 0, previewLayer: '/assets/layers/onion.png' },
  { name: 'Capsicum', category: 'vegetable', stock: 100, threshold: 20, price: 0, previewLayer: '/assets/layers/capcicum.png' },
  { name: 'Mushroom', category: 'vegetable', stock: 100, threshold: 20, price: 15, previewLayer: '/assets/layers/mushroom.png' },
  { name: 'Corn', category: 'vegetable', stock: 100, threshold: 20, price: 10, previewLayer: '/assets/layers/corn.png' },
  { name: 'Olives', category: 'vegetable', stock: 100, threshold: 20, price: 20, previewLayer: '/assets/layers/olives.png' },
  { name: 'Jalapeno', category: 'vegetable', stock: 100, threshold: 20, price: 15, previewLayer: '/assets/layers/jalepeno.png' },
  { name: 'Tomato', category: 'vegetable', stock: 100, threshold: 20, price: 0, previewLayer: '/assets/layers/tomato.png' },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await Inventory.deleteMany({});
  await Inventory.insertMany(inventoryItems);
  console.log(`Inserted ${inventoryItems.length} inventory items.`);

  const adminEmail = 'admin@pizzashop.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
    });
    console.log(`Admin created -> email: ${adminEmail} | password: Admin@123`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  console.log('Seeding complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
