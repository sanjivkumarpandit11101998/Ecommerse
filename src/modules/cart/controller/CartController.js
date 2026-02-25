/**
 * Cart Controller
 * Presentation Layer - Handles HTTP requests for Cart operations
 */

const cartService = require('../service/CartService');

class CartController {
  // Get user's cart
  async getCart(req, res) {
    try {
      const cart = await cartService.getCart(req.user.id);
      res.json({
        success: true,
        data: cart.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add item to cart
  async addToCart(req, res) {
    try {
      const { productVariantId, quantity } = req.body;
      const variantId = productVariantId;
      const cart = await cartService.addToCart(req.user.id, variantId, quantity ?? 1);
      res.status(201).json({
        success: true,
        data: cart.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Remove item from cart
  async removeFromCart(req, res) {
    try {
      const cart = await cartService.removeFromCart(req.user.id, req.params.productVariantId);
      res.json({
        success: true,
        data: cart.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update cart item quantity
  async updateCartItem(req, res) {
    try {
      const { quantity } = req.body;
      const cart = await cartService.updateCartItem(req.user.id, req.params.productVariantId, quantity);
      res.json({
        success: true,
        data: cart.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Clear cart
  async clearCart(req, res) {
    try {
      await cartService.clearCart(req.user.id);
      res.json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new CartController();
