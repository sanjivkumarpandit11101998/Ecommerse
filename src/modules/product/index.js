/**
 * Product Module - Public API
 * Exports the module's public interface for cross-module communication
 */

const ProductController = require('./controller/ProductController');
const ProductService = require('./service/ProductService');
const ProductRepository = require('./repository/ProductRepository');
const productRoutes = require('./productRoutes');

module.exports = {
  ProductController,
  ProductService,
  ProductRepository,
  productRoutes
};
