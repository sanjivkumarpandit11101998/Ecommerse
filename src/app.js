/**
 * Main Application Entry Point
 * Ecommerce Application with Layered Architecture
 */

const express = require('express');
const cors = require('cors');
const config = require('./config/app');
const errorHandler = require('./middleware/errorHandler');

// Import routes from modules (Modular Monolith - Vertical Feature Structure)
const { productRoutes } = require('./modules/product');
const { userRoutes } = require('./modules/user');
const { orderRoutes } = require('./modules/order');
const { cartRoutes } = require('./modules/cart');

// Initialize Express app
const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Ecommerce API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Ecommerce API server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
