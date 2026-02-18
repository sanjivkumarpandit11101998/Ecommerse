/**
 * Main Application Entry Point
 * Ecommerce Application with Layered Architecture
 */

const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/app');
const errorHandler = require('./middleware/errorHandler');

// Import routes from modules (Modular Monolith - Vertical Feature Structure)
const { productRoutes } = require('./modules/product');
const { userRoutes } = require('./modules/user');
const { orderRoutes } = require('./modules/order');
const { cartRoutes } = require('./modules/cart');

// Initialize Express app
const app = express();

// Swagger/OpenAPI setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ecommerce API',
      version: '1.0.0',
      description: 'API documentation for the Ecommerce application',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Files containing annotations as above
  apis: ['src/modules/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check route (includes DB connectivity)
app.get('/health', async (req, res) => {
  const db = require('./config/database');
  let dbStatus = 'unknown';
  try {
    await db.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'disconnected';
  }
  res.json({
    success: true,
    message: 'Ecommerce API is running',
    database: dbStatus,
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
