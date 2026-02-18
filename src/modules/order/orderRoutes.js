const express = require('express');
const router = express.Router();
const orderController = require('./OrderController');
const { authenticate, isAdmin } = require('../../middleware/auth');

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Get orders for the current user (or all orders for admin)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *   post:
 *     summary: Create a new order from the current user's cart
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:
 *                 type: string
 *               shippingAddress:
 *                 type: object
 *     responses:
 *       201:
 *         description: Order created successfully
 *
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the order
 *     responses:
 *       200:
 *         description: Order fetched successfully
 *
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update the status of an order (admin only)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */

// Protected routes
router.get('/', authenticate, orderController.getAllOrders.bind(orderController));
router.get('/:id', authenticate, orderController.getOrderById.bind(orderController));
router.post('/', authenticate, orderController.createOrder.bind(orderController));

// Admin only routes
router.put('/:id/status', authenticate, isAdmin, orderController.updateOrderStatus.bind(orderController));

module.exports = router;
