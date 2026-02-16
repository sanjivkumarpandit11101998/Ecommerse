/**
 * User Module - Public API
 * Exports the module's public interface for cross-module communication
 */

const UserController = require('./UserController');
const UserService = require('./UserService');
const UserRepository = require('./UserRepository');
const userRoutes = require('./userRoutes');

module.exports = {
  UserController,
  UserService,
  UserRepository,
  userRoutes
};
