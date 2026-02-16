/**
 * Cart Repository
 * Data Access Layer for Cart operations
 */

const database = require('../../config/database');
const Cart = require('./Cart');

class CartRepository {
  // Get cart by user ID
  findByUserId(userId) {
    let cart = database.carts.find(c => c.userId === parseInt(userId));
    
    if (!cart) {
      // Create new cart if doesn't exist
      cart = {
        id: database.getNextId(database.carts),
        userId: parseInt(userId),
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      database.carts.push(cart);
    }
    
    return new Cart(cart);
  }

  // Get cart by ID
  findById(id) {
    const cart = database.carts.find(c => c.id === parseInt(id));
    return cart ? new Cart(cart) : null;
  }

  // Update cart
  update(cart) {
    const index = database.carts.findIndex(c => c.id === cart.id);
    if (index === -1) {
      return null;
    }
    
    const updatedCart = {
      ...cart,
      updatedAt: new Date()
    };
    
    database.carts[index] = updatedCart;
    return new Cart(updatedCart);
  }

  // Clear cart
  clear(userId) {
    const cart = this.findByUserId(userId);
    cart.clear();
    return this.update(cart);
  }
}

module.exports = new CartRepository();
