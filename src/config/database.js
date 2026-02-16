/**
 * Database Configuration
 * This file handles database connection setup
 * Currently configured for in-memory storage, can be extended for actual DB
 */

class Database {
  constructor() {
    this.products = [];
    this.users = [];
    this.orders = [];
    this.carts = [];
  }

  // Initialize with sample data
  initialize() {
    // Sample products
    this.products = [
      {
        id: 1,
        name: 'Laptop',
        description: 'High-performance laptop',
        price: 999.99,
        stock: 10,
        category: 'Electronics',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Smartphone',
        description: 'Latest smartphone model',
        price: 699.99,
        stock: 25,
        category: 'Electronics',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Sample user
    this.users = [
      {
        id: 1,
        email: 'admin@example.com',
        password: '$2a$10$rOzJqXJqXJqXJqXJqXJqXO', // hashed password
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // Get next ID for a collection
  getNextId(collection) {
    if (collection.length === 0) return 1;
    return Math.max(...collection.map(item => item.id)) + 1;
  }
}

// Singleton instance
const database = new Database();
database.initialize();

module.exports = database;
