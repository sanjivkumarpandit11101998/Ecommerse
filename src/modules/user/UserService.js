/**
 * User Service
 * Business Logic Layer for User operations
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/app');
const userRepository = require('./UserRepository');

class UserService {
  // Register new user
  async register(userData) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const newUser = await userRepository.create({
        ...userData,
        password: hashedPassword
      });
      
      // Generate JWT token
      const token = this.generateToken(newUser);
      
      return {
        user: newUser.toJSON(),
        token
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Login user
  async login(email, password) {
    try {
      const user = userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      return {
        user: user.toJSON(),
        token
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const user = userRepository.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  // Update user
  async updateUser(id, userData) {
    try {
      // Hash password if provided
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      
      return userRepository.update(id, userData);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = new UserService();
