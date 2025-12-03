const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ============ Middleware ============
app.use(helmet()); // Security headers
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ============ Routes ============
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎯 StockPilot API - Intelligent Inventory Management System',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      suppliers: '/api/suppliers',
      transactions: '/api/transactions',
      dashboard: '/api/dashboard',
      purchaseOrders: '/api/purchase-orders',
      notifications: '/api/notifications',
      categories: '/api/categories'
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/suppliers', require('./routes/supplier.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/purchase-orders', require('./routes/purchaseOrder.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/categories', require('./routes/category.routes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`
    }
  });
});

// Error Handler Middleware
app.use(errorHandler);

module.exports = app;
