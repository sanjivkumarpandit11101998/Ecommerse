/**
 * Product Specification Repository
 * Data access for product_specification records.
 */

const db = require('../../../config/database');

class ProductSpecificationRepository {
  _executor(client) {
    return client || db;
  }

  async findByProductId(productId, client = null) {
    const executor = this._executor(client);
    const result = await executor.query(
      `SELECT specifications
       FROM product_specification
       WHERE product_id = $1`,
      [productId]
    );

    return result.rows[0]?.specifications || null;
  }

  async upsertForProduct(productId, specifications, client = null) {
    const executor = this._executor(client);
    await executor.query(
      `INSERT INTO product_specification (product_id, specifications)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (product_id)
       DO UPDATE SET specifications = EXCLUDED.specifications`,
      [productId, JSON.stringify(specifications)]
    );
  }

  async deleteByProductId(productId, client = null) {
    const executor = this._executor(client);
    await executor.query('DELETE FROM product_specification WHERE product_id = $1', [productId]);
  }
}

module.exports = new ProductSpecificationRepository();
