/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const userController = require('./UserController');
const { authenticate } = require('../../middleware/auth');
const { validateRegister, validateLogin } = require('../../middleware/validator');

// Public routes
router.post('/register', validateRegister, userController.register.bind(userController));
router.post('/login', validateLogin, userController.login.bind(userController));

// Protected routes
router.get('/profile', authenticate, userController.getProfile.bind(userController));
router.put('/profile', authenticate, userController.updateProfile.bind(userController));

module.exports = router;
