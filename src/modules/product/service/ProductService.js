/**
 * Product Service
 * Business Logic Layer for Product operations
 */

const productRepository = require('../repository/ProductRepository');

class ProductService {
  // Get all products with optional filters
  async getAllProducts(filters = {}) {
    try {
      return productRepository.findAll(filters);
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  // Get product by ID
  async getProductById(id) {
    try {
      const product = await productRepository.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  // Create new product
  async createProduct(productData) {
    try {
      return productRepository.create(productData);
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  // Update product
  async updateProduct(id, productData) {
    try {
      const product = await this.getProductById(id);
      return await productRepository.update(id, productData);
    } catch (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  // Delete product
  async deleteProduct(id) {
    try {
      const product = await this.getProductById(id);
      const deleted = await productRepository.delete(id);
      if (!deleted) {
        throw new Error('Failed to delete product');
      }
      return { message: 'Product deleted successfully' };
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
