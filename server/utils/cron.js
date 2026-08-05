const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const { sendLowStockAlert } = require('./mailer');

// Runs every 15 minutes — checks all inventory items against their threshold
const startLowStockJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const lowItems = await Inventory.find({ $expr: { $lt: ['$stock', '$threshold'] } });

      for (const item of lowItems) {
        if (!item.lowStockAlertSent) {
          await sendLowStockAlert(item.name, item.stock, item.threshold);
          item.lowStockAlertSent = true;
          await item.save();
        }
      }

      // Reset the alert flag once stock is replenished above threshold
      await Inventory.updateMany(
        { $expr: { $gte: ['$stock', '$threshold'] }, lowStockAlertSent: true },
        { $set: { lowStockAlertSent: false } }
      );
    } catch (err) {
      console.error('Low stock cron job failed:', err.message);
    }
  });
  console.log('✅ Low-stock monitoring cron job started (every 15 min)');
};

module.exports = { startLowStockJob };
