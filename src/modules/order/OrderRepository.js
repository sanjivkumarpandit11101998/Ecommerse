/**
 * Order Repository
 * Data Access Layer for Order operations
 */

const database = require('../../config/database');
const Order = require('./Order');

class OrderRepository {
  // Get all orders
  findAll(filters = {}) {
    let orders = [...database.orders];
    
    // Apply filters
    if (filters.userId) {
      orders = orders.filter(o => o.userId === parseInt(filters.userId));
    }
    
    if (filters.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    
    return orders.map(o => new Order(o));
  }

  // Get order by ID
  findById(id) {
    const order = database.orders.find(o => o.id === parseInt(id));
    return order ? new Order(order) : null;
  }

  // Create new order
  create(orderData) {
    const validation = Order.validate(orderData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const newOrder = {
      ...orderData,
      id: database.getNextId(database.orders),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    database.orders.push(newOrder);
    return new Order(newOrder);
  }

  // Update order
  update(id, orderData) {
    const index = database.orders.findIndex(o => o.id === parseInt(id));
    if (index === -1) {
      return null;
    }
    
    const updatedOrder = {
      ...database.orders[index],
      ...orderData,
      id: parseInt(id),
      updatedAt: new Date()
    };
    
    database.orders[index] = updatedOrder;
    return new Order(updatedOrder);
  }

  // Update order status
  updateStatus(id, status) {
    return this.update(id, { status });
  }

  // Delete order
  delete(id) {
    const index = database.orders.findIndex(o => o.id === parseInt(id));
    if (index === -1) {
      return false;
    }
    
    database.orders.splice(index, 1);
    return true;
  }
}

module.exports = new OrderRepository();
