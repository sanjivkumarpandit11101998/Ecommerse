/**
 * Cart Service
 * Business Logic Layer for Cart operations
 */

const cartRepository = require('../repository/CartRepository');
const productRepository = require('../../product/repository/ProductRepository');
const productVariantRepository = require('../../product/repository/ProductVariantRepository');

class CartService {
  // Get user's cart
  async getCart(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      return await cartRepository.findByUserId(userId);
    } catch (error) {
      throw new Error(`Failed to fetch cart: ${error.message}`);
    }
  }

  // Add item to cart
  async addToCart(userId, productVariantId, quantity = 1) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!productVariantId) {
        throw new Error('productVariantId is required');
      }

      const safeQuantity = parseInt(quantity, 10);
      if (!Number.isInteger(safeQuantity) || safeQuantity <= 0) {
        throw new Error('Quantity must be a positive integer');
      }

      const productVariant = await productVariantRepository.findById(productVariantId);
      if (!productVariant) {
        throw new Error('Product variant not found');
      }

      const product = await productRepository.findById(productVariant.productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const unitPrice = productVariant.price ?? product.basePrice;
      let cart = await cartRepository.findActiveByUserId(userId);
      if (!cart || cart.status !== 'ACTIVE') {
        cart = await cartRepository.createActiveCart(userId);
      }

      cart.addItem({
        productVariantId: productVariant.id,
        productId: productVariant.productId,
        productName: product.name,
        unitPrice,
        quantity: safeQuantity
      });

      return await cartRepository.update(cart);
    } catch (error) {
      throw new Error(`Failed to add item to cart: ${error.message}`);
    }
  }

  // Remove item from cart
  async removeFromCart(userId, productVariantId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!productVariantId) {
        throw new Error('productVariantId is required');
      }

      const cart = await cartRepository.findByUserId(userId);
      cart.removeItem(productVariantId);
      return await cartRepository.update(cart);
    } catch (error) {
      throw new Error(`Failed to remove item from cart: ${error.message}`);
    }
  }

  // Update item quantity in cart
  async updateCartItem(userId, productVariantId, quantity) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!productVariantId) {
        throw new Error('productVariantId is required');
      }

      const safeQuantity = parseInt(quantity, 10);
      if (!Number.isInteger(safeQuantity) || safeQuantity < 0) {
        throw new Error('Quantity must be a non-negative integer');
      }

      if (safeQuantity > 0) {
        const productVariant = await productVariantRepository.findById(productVariantId);
        if (!productVariant) {
          throw new Error('Product variant not found');
        }
      }

      const cart = await cartRepository.findByUserId(userId);
      cart.updateItemQuantity(productVariantId, safeQuantity);
      return await cartRepository.update(cart);
    } catch (error) {
      throw new Error(`Failed to update cart item: ${error.message}`);
    }
  }

  // Clear cart
  async clearCart(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      return await cartRepository.clear(userId);
    } catch (error) {
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
  }
}

module.exports = new CartService();
