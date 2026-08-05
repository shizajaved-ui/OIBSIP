// Run with: node seed.js
// Populates inventory (5 bases, 5 sauces, cheeses, vegetables) and creates one admin user.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Inventory = require('./models/Inventory');
const User = require('./models/User');

const inventoryItems = [
  // Bases
  { name: 'Classic Hand-Tossed', category: 'base', stock: 100, threshold: 20, price: 0 },
  { name: 'Thin Crust', category: 'base', stock: 100, threshold: 20, price: 0 },
  { name: 'Cheese Burst', category: 'base', stock: 100, threshold: 20, price: 60 },
  { name: 'Whole Wheat', category: 'base', stock: 100, threshold: 20, price: 20 },
  { name: 'Stuffed Crust', category: 'base', stock: 100, threshold: 20, price: 80 },
  // Sauces
  { name: 'Classic Tomato', category: 'sauce', stock: 100, threshold: 20, price: 0 },
  { name: 'Peri Peri', category: 'sauce', stock: 100, threshold: 20, price: 10 },
  { name: 'BBQ', category: 'sauce', stock: 100, threshold: 20, price: 15 },
  { name: 'Alfredo (White Sauce)', category: 'sauce', stock: 100, threshold: 20, price: 20 },
  { name: 'Pesto', category: 'sauce', stock: 100, threshold: 20, price: 25 },
  // Cheese
  { name: 'Mozzarella', category: 'cheese', stock: 100, threshold: 20, price: 0 },
  { name: 'Cheddar Blend', category: 'cheese', stock: 100, threshold: 20, price: 20 },
  { name: 'Vegan Cheese', category: 'cheese', stock: 100, threshold: 20, price: 30 },
  // Vegetables
  { name: 'Onion', category: 'vegetable', stock: 100, threshold: 20, price: 0 },
  { name: 'Capsicum', category: 'vegetable', stock: 100, threshold: 20, price: 0 },
  { name: 'Mushroom', category: 'vegetable', stock: 100, threshold: 20, price: 15 },
  { name: 'Corn', category: 'vegetable', stock: 100, threshold: 20, price: 10 },
  { name: 'Olives', category: 'vegetable', stock: 100, threshold: 20, price: 20 },
  { name: 'Jalapeno', category: 'vegetable', stock: 100, threshold: 20, price: 15 },
  { name: 'Tomato', category: 'vegetable', stock: 100, threshold: 20, price: 0 },
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
