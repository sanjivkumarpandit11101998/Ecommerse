/**
 * Product Repository
 * Data Access Layer for Product operations (PostgreSQL)
 */

const db = require('../../../config/database');
const Product = require('../Product');

class ProductRepository {
  // Get all products
  async findAll(filters = {}) {
    let query = 'SELECT id, name, description, price, stock, category, image_url, created_at, updated_at FROM products WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(filters.category);
    }
    if (filters.minPrice !== undefined) {
      query += ` AND price >= $${paramIndex++}`;
      params.push(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query += ` AND price <= $${paramIndex++}`;
      params.push(filters.maxPrice);
    }
    if (filters.search) {
      query += ` AND (LOWER(name) LIKE $${paramIndex} OR LOWER(description) LIKE $${paramIndex})`;
      params.push(`%${filters.search.toLowerCase()}%`);
      paramIndex++;
    }

    query += ' ORDER BY id';

    const result = await db.query(query, params);
    return result.rows.map(row => this._rowToProduct(row));
  }

  // Get product by ID
  async findById(id) {
    const result = await db.query(
      'SELECT id, name, description, price, stock, category, image_url, created_at, updated_at FROM products WHERE id = $1',
      [parseInt(id)]
    );
    return result.rows[0] ? this._rowToProduct(result.rows[0]) : null;
  }

  // Create new product
  async create(productData) {
    const validation = Product.validate(productData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const result = await db.query(
      `INSERT INTO products (name, description, price, stock, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, price, stock, category, image_url, created_at, updated_at`,
      [
        productData.name,
        productData.description || '',
        productData.price,
        productData.stock ?? 0,
        productData.category || '',
        productData.imageUrl || ''
      ]
    );
    return this._rowToProduct(result.rows[0]);
  }

  // Update product
  async update(id, productData) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updatedProduct = { ...existing.toJSON(), ...productData, id: parseInt(id) };
    const validation = Product.validate(updatedProduct);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    await db.query(
      `UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category = $5, image_url = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [
        productData.name ?? existing.name,
        productData.description ?? existing.description,
        productData.price ?? existing.price,
        productData.stock ?? existing.stock,
        productData.category ?? existing.category,
        productData.imageUrl ?? existing.imageUrl,
        parseInt(id)
      ]
    );

    return this.findById(id);
  }

  // Delete product
  async delete(id) {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [parseInt(id)]);
    return result.rowCount > 0;
  }

  // Update stock
  async updateStock(id, quantity) {
    const product = await this.findById(id);
    if (!product) return null;

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    return this.update(id, { stock: newStock });
  }

  _rowToProduct(row) {
    return new Product({
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      stock: parseInt(row.stock, 10),
      category: row.category,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
}

module.exports = new ProductRepository();
