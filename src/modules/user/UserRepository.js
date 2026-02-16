/**
 * User Repository
 * Data Access Layer for User operations
 */

const database = require('../../config/database');
const User = require('./User');

class UserRepository {
  // Get all users
  findAll() {
    return database.users.map(u => new User(u));
  }

  // Get user by ID
  findById(id) {
    const user = database.users.find(u => u.id === parseInt(id));
    return user ? new User(user) : null;
  }

  // Get user by email
  findByEmail(email) {
    const user = database.users.find(u => u.email === email);
    return user ? new User(user) : null;
  }

  // Create new user
  create(userData) {
    // Check if email already exists
    if (this.findByEmail(userData.email)) {
      throw new Error('Email already exists');
    }
    
    const validation = User.validate(userData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const newUser = {
      ...userData,
      id: database.getNextId(database.users),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    database.users.push(newUser);
    return new User(newUser);
  }

  // Update user
  update(id, userData) {
    const index = database.users.findIndex(u => u.id === parseInt(id));
    if (index === -1) {
      return null;
    }
    
    // Check email uniqueness if email is being updated
    if (userData.email && userData.email !== database.users[index].email) {
      if (this.findByEmail(userData.email)) {
        throw new Error('Email already exists');
      }
    }
    
    const updatedUser = {
      ...database.users[index],
      ...userData,
      id: parseInt(id),
      updatedAt: new Date()
    };
    
    // Validate if password is being updated
    if (userData.password) {
      const validation = User.validate(updatedUser);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
    }
    
    database.users[index] = updatedUser;
    return new User(updatedUser);
  }

  // Delete user
  delete(id) {
    const index = database.users.findIndex(u => u.id === parseInt(id));
    if (index === -1) {
      return false;
    }
    
    database.users.splice(index, 1);
    return true;
  }
}

module.exports = new UserRepository();
