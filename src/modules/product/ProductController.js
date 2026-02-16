/**
 * Product Controller
 * Presentation Layer - Handles HTTP requests for Product operations
 */

const productService = require('./ProductService');

class ProductController {
  // Get all products
  async getAllProducts(req, res) {
    try {
      const filters = {
        category: req.query.category,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        search: req.query.search
      };
      
      const products = await productService.getAllProducts(filters);
      res.json({
        success: true,
        data: products.map(p => p.toJSON())
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get product by ID
  async getProductById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json({
        success: true,
        data: product.toJSON()
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create product
  async createProduct(req, res) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update product
  async updateProduct(req, res) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      res.json({
        success: true,
        data: product.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ProductController();
