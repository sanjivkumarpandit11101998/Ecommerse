/**
 * Product Review Repository
 * Data access for review records.
 */

const db = require('../../../config/database');

class ProductReviewRepository {
  _executor(client) {
    return client || db;
  }

  async findByProductId(productId, client = null) {
    const executor = this._executor(client);
    const result = await executor.query(
      `SELECT id, product_id, user_id, rating, comment, created_at
       FROM review
       WHERE product_id = $1
       ORDER BY created_at DESC`,
      [productId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      productId: row.product_id,
      userId: row.user_id,
      rating: Number(row.rating),
      comment: row.comment,
      createdAt: row.created_at
    }));
  }

  async create(reviewData, client = null) {
    const executor = this._executor(client);
    const result = await executor.query(
      `INSERT INTO review (product_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING id, product_id, user_id, rating, comment, created_at`,
      [
        reviewData.productId,
        reviewData.userId,
        reviewData.rating,
        reviewData.comment || null
      ]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      productId: row.product_id,
      userId: row.user_id,
      rating: Number(row.rating),
      comment: row.comment,
      createdAt: row.created_at
    };
  }

  async findByIdAndProductId(reviewId, productId, client = null) {
    const executor = this._executor(client);
    const result = await executor.query(
      `SELECT id, product_id, user_id, rating, comment, created_at
       FROM review
       WHERE id = $1 AND product_id = $2`,
      [reviewId, productId]
    );

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      productId: row.product_id,
      userId: row.user_id,
      rating: Number(row.rating),
      comment: row.comment,
      createdAt: row.created_at
    };
  }

  async deleteByIdAndProductId(reviewId, productId, client = null) {
    const executor = this._executor(client);
    const result = await executor.query(
      `DELETE FROM review
       WHERE id = $1 AND product_id = $2
       RETURNING id`,
      [reviewId, productId]
    );
    return result.rowCount > 0;
  }

  async refreshAverageRating(productId, client = null) {
    const executor = this._executor(client);
    await executor.query(
      `UPDATE product p
       SET average_rating = COALESCE((
         SELECT ROUND(AVG(r.rating)::numeric, 1)
         FROM review r
         WHERE r.product_id = p.id
       ), 0),
       updated_at = CURRENT_TIMESTAMP
       WHERE p.id = $1`,
      [productId]
    );
  }
}

module.exports = new ProductReviewRepository();
