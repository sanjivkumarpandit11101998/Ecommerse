const express = require('express');
const router = express.Router();
const cartController = require('./controller/CartController');
const { authenticate } = require('../../middleware/auth');

/**
 * @openapi
 * /api/cart:
 *   get:
 *     summary: Get the current user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 *   delete:
 *     summary: Clear the current user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *
 * /api/cart/items:
 *   post:
 *     summary: Add an item to the cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productVariantId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Item added to cart
 *
 * /api/cart/items/{productVariantId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productVariantId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the product variant to remove
 *     responses:
 *       200:
 *         description: Item removed from cart
 *   put:
 *     summary: Update quantity of an item in the cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productVariantId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the product variant to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item updated
 */

// All cart routes require authentication
router.get('/', authenticate, cartController.getCart.bind(cartController));
router.post('/items', authenticate, cartController.addToCart.bind(cartController));
router.delete('/items/:productVariantId', authenticate, cartController.removeFromCart.bind(cartController));
router.put('/items/:productVariantId', authenticate, cartController.updateCartItem.bind(cartController));
router.delete('/', authenticate, cartController.clearCart.bind(cartController));

module.exports = router;
