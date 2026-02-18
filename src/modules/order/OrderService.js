/**
 * Order Service
 * Business Logic Layer for Order operations
 */

const orderRepository = require('./OrderRepository');
const cartRepository = require('../cart/CartRepository');
const productRepository = require('../product/repository/ProductRepository');

class OrderService {
  // Get all orders
  async getAllOrders(filters = {}) {
    try {
      return orderRepository.findAll(filters);
    } catch (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }
  }

  // Get order by ID
  async getOrderById(id) {
    try {
      const order = await orderRepository.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error) {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
  }

  // Create order from cart
  async createOrderFromCart(userId, orderData) {
    try {
      // Get user's cart
      const cart = await cartRepository.findByUserId(userId);
      
      if (cart.items.length === 0) {
        throw new Error('Cart is empty');
      }
      
      // Verify products exist and have sufficient stock
      const orderItems = [];
      for (const cartItem of cart.items) {
        const product = await productRepository.findById(cartItem.productId);
        if (!product) {
          throw new Error(`Product ${cartItem.productId} not found`);
        }
        
        if (product.stock < cartItem.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }
        
        orderItems.push({
          productId: cartItem.productId,
          name: product.name,
          quantity: cartItem.quantity,
          price: cartItem.price
        });
      }
      
      // Calculate total
      const totalAmount = orderItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
      
      // Create order
      const order = await orderRepository.create({
        userId,
        items: orderItems,
        totalAmount,
        status: 'pending',
        shippingAddress: orderData.shippingAddress || {},
        paymentMethod: orderData.paymentMethod || ''
      });
      
      // Update product stock
      for (const item of orderItems) {
        await productRepository.updateStock(item.productId, -item.quantity);
      }
      
      // Clear cart
      await cartRepository.clear(userId);
      
      return order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  // Update order status
  async updateOrderStatus(id, status) {
    try {
      const order = await this.getOrderById(id);
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid order status');
      }
      
      return await orderRepository.updateStatus(id, status);
    } catch (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  // Get user orders
  async getUserOrders(userId) {
    try {
      return orderRepository.findAll({ userId });
    } catch (error) {
      throw new Error(`Failed to fetch user orders: ${error.message}`);
    }
  }
}

module.exports = new OrderService();
