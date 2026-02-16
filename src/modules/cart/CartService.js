/**
 * Cart Service
 * Business Logic Layer for Cart operations
 */

const cartRepository = require('./CartRepository');
const productRepository = require('../product/ProductRepository');

class CartService {
  // Get user's cart
  async getCart(userId) {
    try {
      return cartRepository.findByUserId(userId);
    } catch (error) {
      throw new Error(`Failed to fetch cart: ${error.message}`);
    }
  }

  // Add item to cart
  async addToCart(userId, productId, quantity = 1) {
    try {
      // Verify product exists
      const product = productRepository.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Check stock availability
      if (product.stock < quantity) {
        throw new Error('Insufficient stock');
      }
      
      // Get cart
      const cart = cartRepository.findByUserId(userId);
      
      // Add item
      cart.addItem(productId, quantity, product.price);
      
      // Update cart
      return cartRepository.update(cart);
    } catch (error) {
      throw new Error(`Failed to add item to cart: ${error.message}`);
    }
  }

  // Remove item from cart
  async removeFromCart(userId, productId) {
    try {
      const cart = cartRepository.findByUserId(userId);
      cart.removeItem(productId);
      return cartRepository.update(cart);
    } catch (error) {
      throw new Error(`Failed to remove item from cart: ${error.message}`);
    }
  }

  // Update item quantity in cart
  async updateCartItem(userId, productId, quantity) {
    try {
      // Verify product exists
      const product = productRepository.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Check stock availability
      if (product.stock < quantity) {
        throw new Error('Insufficient stock');
      }
      
      const cart = cartRepository.findByUserId(userId);
      cart.updateItemQuantity(productId, quantity);
      return cartRepository.update(cart);
    } catch (error) {
      throw new Error(`Failed to update cart item: ${error.message}`);
    }
  }

  // Clear cart
  async clearCart(userId) {
    try {
      return cartRepository.clear(userId);
    } catch (error) {
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
  }
}

module.exports = new CartService();
