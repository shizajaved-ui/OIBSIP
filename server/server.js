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

// Immediate Health Check for Railway
app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  } else {
    res.json({ status: 'API is running' });
  }
});

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

// Global error handler — must be registered after every route above.
// Express only recognizes a middleware with 4 arguments as an error handler
// if nothing else runs after it; a route added below this point would
// silently bypass it.
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 8080;

// Start server IMMEDIATELY so Railway health check passes
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server booting on port ${PORT}...`);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`✅ MongoDB Connected | Env: ${process.env.NODE_ENV || 'development'}`);
    startLowStockJob();
    console.log(`🍕 Ready for orders!`);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err.message);
  });

// Ensure Railway doesn't kill the connection too early
server.keepAliveTimeout = 61000;
server.headersTimeout = 65000;
