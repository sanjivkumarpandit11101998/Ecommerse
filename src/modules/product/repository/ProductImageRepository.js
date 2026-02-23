/**
 * Product Image Repository
 * Data access for product_image records.
 */

const db = require('../../../config/database');

class ProductImageRepository {
  _executor(client) {
    return client || db;
  }

  async findByProductId(productId, client = null) {
    const executor = this._executor(client);
    const result = await executor.query(
      `SELECT image_url, is_primary, sort_order
       FROM product_image
       WHERE product_id = $1
       ORDER BY sort_order ASC, is_primary DESC`,
      [productId]
    );

    return result.rows.map((row) => ({
      imageUrl: row.image_url,
      isPrimary: row.is_primary,
      sortOrder: row.sort_order
    }));
  }

  async findPrimaryByProductIds(productIds, client = null) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return new Map();
    }

    const executor = this._executor(client);
    const result = await executor.query(
      `SELECT DISTINCT ON (product_id)
         product_id, image_url, is_primary, sort_order
       FROM product_image
       WHERE product_id = ANY($1::uuid[]) AND is_primary = TRUE
       ORDER BY product_id, sort_order ASC`,
      [productIds]
    );

    const byProductId = new Map();
    for (const row of result.rows) {
      byProductId.set(row.product_id, {
        imageUrl: row.image_url,
        isPrimary: row.is_primary,
        sortOrder: row.sort_order
      });
    }
    return byProductId;
  }

  async createForProduct(productId, images = [], client = null) {
    if (!Array.isArray(images) || images.length === 0) {
      return;
    }

    const executor = this._executor(client);
    for (const image of images) {
      await executor.query(
        `INSERT INTO product_image (product_id, image_url, is_primary, sort_order)
         VALUES ($1, $2, $3, $4)`,
        [productId, image.imageUrl, Boolean(image.isPrimary), image.sortOrder ?? 0]
      );
    }
  }

  async deleteByProductId(productId, client = null) {
    const executor = this._executor(client);
    await executor.query('DELETE FROM product_image WHERE product_id = $1', [productId]);
  }

  async replaceForProduct(productId, images = [], client = null) {
    await this.deleteByProductId(productId, client);
    await this.createForProduct(productId, images, client);
  }
}

module.exports = new ProductImageRepository();
