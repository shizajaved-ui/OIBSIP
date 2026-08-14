require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const { startLowStockJob } = require('./utils/cron');

const app = express();

// Required for express-rate-limit to work behind Railway's proxy
app.set('trust proxy', 1);

// Immediate Health Check for Railway - must be at the top
app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// In production, only allow requests from the deployed frontend (CLIENT_URL).
// Locally, CLIENT_URL is usually unset or points to localhost, so this stays
// permissive during development without any extra config.
const allowedOrigin = process.env.CLIENT_URL || '*';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then START server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`✅ MongoDB Connected`);
    startLowStockJob();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🍕 Server Live | Port: ${PORT}`);
    });

    server.keepAliveTimeout = 61000;
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    // Exit so Railway knows to restart if DB is down
    process.exit(1);
  });
