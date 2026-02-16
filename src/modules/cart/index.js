/**
 * Cart Module - Public API
 * Exports the module's public interface for cross-module communication
 */

const CartController = require('./CartController');
const CartService = require('./CartService');
const CartRepository = require('./CartRepository');
const cartRoutes = require('./cartRoutes');

module.exports = {
  CartController,
  CartService,
  CartRepository,
  cartRoutes
};
