/**
 * Product Model
 * Represents a product entity in the ecommerce system
 */

class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description || '';
    this.price = data.price;
    this.stock = data.stock || 0;
    this.category = data.category || '';
    this.imageUrl = data.imageUrl || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Validate product data
  static validate(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Product name is required');
    }
    
    if (!data.price || data.price <= 0) {
      errors.push('Product price must be greater than 0');
    }
    
    if (data.stock !== undefined && data.stock < 0) {
      errors.push('Stock cannot be negative');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      stock: this.stock,
      category: this.category,
      imageUrl: this.imageUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Product;
