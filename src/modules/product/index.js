/**
 * Product Module - Public API
 * Exports the module's public interface for cross-module communication
 */

const ProductController = require('./ProductController');
const ProductService = require('./ProductService');
const ProductRepository = require('./ProductRepository');
const productRoutes = require('./productRoutes');

module.exports = {
  ProductController,
  ProductService,
  ProductRepository,
  productRoutes
};
