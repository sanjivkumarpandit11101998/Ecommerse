/**
 * Cart Model
 * Represents a shopping cart entity in the ecommerce system
 */

class Cart {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.items = data.items || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Add item to cart
  addItem(productId, quantity, price) {
    const existingItem = this.items.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        productId,
        quantity,
        price
      });
    }
    
    this.updatedAt = new Date();
  }

  // Remove item from cart
  removeItem(productId) {
    this.items = this.items.filter(item => item.productId !== productId);
    this.updatedAt = new Date();
  }

  // Update item quantity
  updateItemQuantity(productId, quantity) {
    const item = this.items.find(item => item.productId === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.updatedAt = new Date();
      }
    }
  }

  // Calculate total
  calculateTotal() {
    return this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  // Clear cart
  clear() {
    this.items = [];
    this.updatedAt = new Date();
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items,
      total: this.calculateTotal(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Cart;
