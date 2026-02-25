/**
 * Cart Module - Public API
 * Exports the module's public interface for cross-module communication
 */

const CartController = require('./controller/CartController');
const CartService = require('./service/CartService');
const CartRepository = require('./repository/CartRepository');
const cartRoutes = require('./cartRoutes');

module.exports = {
  CartController,
  CartService,
  CartRepository,
  cartRoutes
};
