/**
 * Product Service
 * Business logic and orchestration for product operations.
 */

const db = require('../../../config/database');
const Product = require('../Product');
const productRepository = require('../repository/ProductRepository');
const productImageRepository = require('../repository/ProductImageRepository');
const productVariantRepository = require('../repository/ProductVariantRepository');
const productSpecificationRepository = require('../repository/ProductSpecificationRepository');
const productReviewRepository = require('../repository/ProductReviewRepository');

class ProductService {
  _validateProduct(productData) {
    const validation = Product.validate(productData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
  }

  _validateCreatePayload(productData) {
    this._validateProduct(productData);

    if (!Array.isArray(productData.images) || productData.images.length === 0) {
      throw new Error('images is required and must contain at least one item');
    }
    if (productData.images.some((image) => !image || !image.imageUrl)) {
      throw new Error('Each image must include imageUrl');
    }

    if (!Array.isArray(productData.variants) || productData.variants.length === 0) {
      throw new Error('variants is required and must contain at least one item');
    }
    if (productData.variants.some((variant) => !variant || !variant.sku)) {
      throw new Error('Each variant must include sku');
    }

    if (!productData.specifications || typeof productData.specifications !== 'object' || Array.isArray(productData.specifications)) {
      throw new Error('specifications is required and must be a JSON object');
    }
  }

  // Get all products with optional filters
  async getAllProducts(filters = {}) {
    try {
      const effectiveFilters = {
        ...filters,
        status: filters.status || 'ACTIVE'
      };

      const result = await productRepository.findAll(effectiveFilters);
      const products = result.items;
      const productCards = [];

      for (const product of products) {
        const primaryImage = Array.isArray(product.images) && product.images.length > 0
          ? (product.images.find((image) => image.isPrimary) || product.images[0])
          : null;
        const variants = Array.isArray(product.variants) ? product.variants : [];

        if (variants.length === 0) {
          productCards.push({
            id: product.id,
            name: product.name,
            slug: product.slug,
            primaryImage: primaryImage ? primaryImage.imageUrl : null,
            amount: product.basePrice,
            rating: product.averageRating,
            variant: null
          });
          continue;
        }

        for (const variant of variants) {
          productCards.push({
            id: product.id,
            name: product.name,
            slug: product.slug,
            primaryImage: primaryImage ? primaryImage.imageUrl : null,
            amount: variant.price ?? product.basePrice,
            rating: product.averageRating,
            variant
          });
        }
      }

      return {
        items: productCards,
        pagination: result.pagination
      };
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  // Get product by ID
  async getProductById(id) {
    try {
      const product = await productRepository.findById(id);
      if (!product || product.status !== 'ACTIVE') {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  // Get reviews for a product
  async getProductReviews(productId) {
    try {
      const product = await productRepository.findById(productId);
      if (!product || product.status !== 'ACTIVE') {
        throw new Error('Product not found');
      }

      return productReviewRepository.findByProductId(productId);
    } catch (error) {
      throw new Error(`Failed to fetch product reviews: ${error.message}`);
    }
  }

  // Create review for a product
  async createProductReview(productId, reviewData) {
    let client;
    try {
      const product = await productRepository.findById(productId);
      if (!product || product.status !== 'ACTIVE') {
        throw new Error('Product not found');
      }

      client = await db.getClient();
      await client.query('BEGIN');

      const review = await productReviewRepository.create(
        {
          productId,
          userId: reviewData.userId,
          rating: reviewData.rating,
          comment: reviewData.comment
        },
        client
      );

      await productReviewRepository.refreshAverageRating(productId, client);
      await client.query('COMMIT');

      return review;
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      throw new Error(`Failed to create product review: ${error.message}`);
    } finally {
      if (client) client.release();
    }
  }

  // Delete review for a product
  async deleteProductReview(productId, reviewId) {
    let client;
    try {
      const product = await productRepository.findById(productId);
      if (!product || product.status !== 'ACTIVE') {
        throw new Error('Product not found');
      }

      client = await db.getClient();
      await client.query('BEGIN');

      const review = await productReviewRepository.findByIdAndProductId(reviewId, productId, client);
      if (!review) {
        throw new Error('Review not found');
      }

      const deleted = await productReviewRepository.deleteByIdAndProductId(reviewId, productId, client);
      if (!deleted) {
        throw new Error('Failed to delete review');
      }

      await productReviewRepository.refreshAverageRating(productId, client);
      await client.query('COMMIT');

      return { message: 'Review deleted successfully' };
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      throw new Error(`Failed to delete product review: ${error.message}`);
    } finally {
      if (client) client.release();
    }
  }

  // Create new product
  async createProduct(productData) {
    let client;
    try {
      this._validateCreatePayload(productData);

      client = await db.getClient();
      await client.query('BEGIN');

      const product = await productRepository.create(productData, client);

      if (Array.isArray(productData.images) && productData.images.length > 0) {
        await productImageRepository.createForProduct(product.id, productData.images, client);
      }

      if (Array.isArray(productData.variants) && productData.variants.length > 0) {
        await productVariantRepository.createForProduct(product.id, productData.variants, client);
      }

      if (productData.specifications && typeof productData.specifications === 'object') {
        await productSpecificationRepository.upsertForProduct(
          product.id,
          productData.specifications,
          client
        );
      }

      await client.query('COMMIT');
      return this.getProductById(product.id);
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      throw new Error(`Failed to create product: ${error.message}`);
    } finally {
      if (client) client.release();
    }
  }

  // Update product
  async updateProduct(id, productData) {
    let client;
    try {
      const existingProduct = await productRepository.findById(id);
      if (!existingProduct) {
        throw new Error('Product not found');
      }

      const mergedData = {
        ...existingProduct.toJSON(),
        ...productData,
        id
      };
      this._validateProduct(mergedData);

      client = await db.getClient();
      await client.query('BEGIN');

      await productRepository.update(id, mergedData, client);

      if (Array.isArray(productData.images)) {
        await productImageRepository.replaceForProduct(id, productData.images, client);
      }

      if (Array.isArray(productData.variants)) {
        await productVariantRepository.replaceForProduct(id, productData.variants, client);
      }

      if (productData.specifications !== undefined) {
        if (productData.specifications && typeof productData.specifications === 'object') {
          await productSpecificationRepository.upsertForProduct(id, productData.specifications, client);
        } else {
          await productSpecificationRepository.deleteByProductId(id, client);
        }
      }

      await client.query('COMMIT');
      return this.getProductById(id);
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      throw new Error(`Failed to update product: ${error.message}`);
    } finally {
      if (client) client.release();
    }
  }

  // Delete product
  async deleteProduct(id) {
    try {
      const product = await productRepository.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }
      if (product.status === 'DELETED') {
        throw new Error('Product already deleted');
      }

      const deleted = await productRepository.delete(id);
      if (!deleted) {
        throw new Error('Failed to delete product');
      }
      return { message: 'Product marked as deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  // Update product stock
  async updateStock(id, quantity) {
    try {
      return productRepository.updateStock(id, quantity);
    } catch (error) {
      throw new Error(`Failed to update stock: ${error.message}`);
    }
  }
}

module.exports = new ProductService();
