/**
 * User Model
 * Represents a user entity in the ecommerce system
 */

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.name = data.name || '';
    this.role = data.role || 'customer';
    this.address = data.address || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Validate user data
  static validate(data) {
    const errors = [];
    
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }
    
    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Email validation
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Convert to JSON (excluding password)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      address: this.address,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
