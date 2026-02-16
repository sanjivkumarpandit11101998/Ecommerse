/**
 * Order Model
 * Represents an order entity in the ecommerce system
 */

class Order {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.items = data.items || [];
    this.totalAmount = data.totalAmount || 0;
    this.status = data.status || 'pending';
    this.shippingAddress = data.shippingAddress || {};
    this.paymentMethod = data.paymentMethod || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Validate order data
  static validate(data) {
    const errors = [];
    
    if (!data.userId) {
      errors.push('User ID is required');
    }
    
    if (!data.items || data.items.length === 0) {
      errors.push('Order must contain at least one item');
    }
    
    if (data.totalAmount <= 0) {
      errors.push('Total amount must be greater than 0');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Calculate total from items
  calculateTotal() {
    return this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items,
      totalAmount: this.totalAmount,
      status: this.status,
      shippingAddress: this.shippingAddress,
      paymentMethod: this.paymentMethod,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Order;
