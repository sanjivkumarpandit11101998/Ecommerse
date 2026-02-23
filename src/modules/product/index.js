/**
 * Product Module - Public API
 * Exports the module's public interface for cross-module communication
 */

const ProductController = require('./controller/ProductController');
const ReviewController = require('./controller/ReviewController');
const ProductService = require('./service/ProductService');
const ProductRepository = require('./repository/ProductRepository');
const ProductImageRepository = require('./repository/ProductImageRepository');
const ProductVariantRepository = require('./repository/ProductVariantRepository');
const ProductSpecificationRepository = require('./repository/ProductSpecificationRepository');
const ProductReviewRepository = require('./repository/ProductReviewRepository');
const productRoutes = require('./productRoutes');

module.exports = {
  ProductController,
  ReviewController,
  ProductService,
  ProductRepository,
  ProductImageRepository,
  ProductVariantRepository,
  ProductSpecificationRepository,
  ProductReviewRepository,
  productRoutes
};
