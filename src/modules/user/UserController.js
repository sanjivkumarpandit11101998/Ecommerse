/**
 * User Controller
 * Presentation Layer - Handles HTTP requests for User operations
 */

const userService = require('./UserService');

class UserController {
  // Register user
  async register(req, res) {
    try {
      const result = await userService.register(req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await userService.getUserById(req.user.id);
      res.json({
        success: true,
        data: user.toJSON()
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const user = await userService.updateUser(req.user.id, req.body);
      res.json({
        success: true,
        data: user.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController();
