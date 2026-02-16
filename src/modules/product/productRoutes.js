/**
 * Product Routes
 */

const express = require('express');
const router = express.Router();
const productController = require('./ProductController');
const { authenticate, isAdmin } = require('../../middleware/auth');
const { validateProduct } = require('../../middleware/validator');

// Public routes
router.get('/', productController.getAllProducts.bind(productController));
router.get('/:id', productController.getProductById.bind(productController));

// Protected routes (admin only)
router.post('/', authenticate, isAdmin, validateProduct, productController.createProduct.bind(productController));
router.put('/:id', authenticate, isAdmin, validateProduct, productController.updateProduct.bind(productController));
router.delete('/:id', authenticate, isAdmin, productController.deleteProduct.bind(productController));

module.exports = router;
