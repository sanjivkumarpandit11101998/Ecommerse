/**
 * Product Repository
 * Data Access Layer for Product operations
 */

const database = require('../../config/database');
const Product = require('./Product');

class ProductRepository {
  // Get all products
  findAll(filters = {}) {
    let products = [...database.products];
    
    // Apply filters
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    
    if (filters.minPrice) {
      products = products.filter(p => p.price >= filters.minPrice);
    }
    
    if (filters.maxPrice) {
      products = products.filter(p => p.price <= filters.maxPrice);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    return products.map(p => new Product(p));
  }

  // Get product by ID
  findById(id) {
    const product = database.products.find(p => p.id === parseInt(id));
    return product ? new Product(product) : null;
  }

  // Create new product
  create(productData) {
    const validation = Product.validate(productData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const newProduct = {
      ...productData,
      id: database.getNextId(database.products),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    database.products.push(newProduct);
    return new Product(newProduct);
  }

  // Update product
  update(id, productData) {
    const index = database.products.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return null;
    }
    
    const updatedProduct = {
      ...database.products[index],
      ...productData,
      id: parseInt(id),
      updatedAt: new Date()
    };
    
    const validation = Product.validate(updatedProduct);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    database.products[index] = updatedProduct;
    return new Product(updatedProduct);
  }

  // Delete product
  delete(id) {
    const index = database.products.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return false;
    }
    
    database.products.splice(index, 1);
    return true;
  }

  // Update stock
  updateStock(id, quantity) {
    const product = this.findById(id);
    if (!product) {
      return null;
    }
    
    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }
    
    return this.update(id, { stock: newStock });
  }
}

module.exports = new ProductRepository();
