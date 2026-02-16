/**
 * Cart Routes
 */

const express = require('express');
const router = express.Router();
const cartController = require('./CartController');
const { authenticate } = require('../../middleware/auth');

// All cart routes require authentication
router.get('/', authenticate, cartController.getCart.bind(cartController));
router.post('/items', authenticate, cartController.addToCart.bind(cartController));
router.delete('/items/:productId', authenticate, cartController.removeFromCart.bind(cartController));
router.put('/items/:productId', authenticate, cartController.updateCartItem.bind(cartController));
router.delete('/', authenticate, cartController.clearCart.bind(cartController));

module.exports = router;
