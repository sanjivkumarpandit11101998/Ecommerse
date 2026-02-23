/**
 * Review Controller
 * Handles HTTP requests for product reviews.
 */

const productService = require('../service/ProductService');

class ReviewController {
  // Get reviews for a product
  async getProductReviews(req, res) {
    try {
      const reviews = await productService.getProductReviews(req.params.id);
      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create a review for a product
  async createProductReview(req, res) {
    try {
      const reviewPayload = {
        ...req.body,
        userId: req.user?.id || req.body.userId
      };
      const review = await productService.createProductReview(req.params.id, reviewPayload);
      res.status(201).json({
        success: true,
        data: review
      });
    } catch (error) {
      const statusCode = error.message.includes('Product not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete a review for a product
  async deleteProductReview(req, res) {
    try {
      const result = await productService.deleteProductReview(req.params.id, req.params.reviewId);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      const statusCode = (
        error.message.includes('Product not found') ||
        error.message.includes('Review not found')
      ) ? 404 : 400;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ReviewController();
