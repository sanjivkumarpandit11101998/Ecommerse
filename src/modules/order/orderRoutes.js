/**
 * Order Routes
 */

const express = require('express');
const router = express.Router();
const orderController = require('./OrderController');
const { authenticate, isAdmin } = require('../../middleware/auth');

// Protected routes
router.get('/', authenticate, orderController.getAllOrders.bind(orderController));
router.get('/:id', authenticate, orderController.getOrderById.bind(orderController));
router.post('/', authenticate, orderController.createOrder.bind(orderController));

// Admin only routes
router.put('/:id/status', authenticate, isAdmin, orderController.updateOrderStatus.bind(orderController));

module.exports = router;
