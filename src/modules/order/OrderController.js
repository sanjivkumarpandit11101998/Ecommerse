/**
 * Order Controller
 * Presentation Layer - Handles HTTP requests for Order operations
 */

const orderService = require('./OrderService');

class OrderController {
  // Get all orders (admin) or user orders
  async getAllOrders(req, res) {
    try {
      const filters = {
        userId: req.user.role === 'admin' ? req.query.userId : req.user.id,
        status: req.query.status
      };
      
      const orders = await orderService.getAllOrders(filters);
      res.json({
        success: true,
        data: orders.map(o => o.toJSON())
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get order by ID
  async getOrderById(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      
      // Check if user has access to this order
      if (req.user.role !== 'admin' && order.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      res.json({
        success: true,
        data: order.toJSON()
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create order from cart
  async createOrder(req, res) {
    try {
      const order = await orderService.createOrderFromCart(req.user.id, req.body);
      res.status(201).json({
        success: true,
        data: order.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update order status (admin only)
  async updateOrderStatus(req, res) {
    try {
      const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
      res.json({
        success: true,
        data: order.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new OrderController();
