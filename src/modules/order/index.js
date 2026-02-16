/**
 * Order Module - Public API
 * Exports the module's public interface for cross-module communication
 */

const OrderController = require('./OrderController');
const OrderService = require('./OrderService');
const OrderRepository = require('./OrderRepository');
const orderRoutes = require('./orderRoutes');

module.exports = {
  OrderController,
  OrderService,
  OrderRepository,
  orderRoutes
};
