/**
 * Cart Repository
 * Data Access Layer for Cart operations (PostgreSQL)
 */

const db = require('../../../config/database');
const Cart = require('../Cart');

class CartRepository {
  // Get cart by user ID (returns active cart or creates a new active cart)
  async findByUserId(userId) {
    const activeCart = await this.findActiveByUserId(userId);
    if (activeCart) {
      return activeCart;
    }

    return await this.createActiveCart(userId);
  }

  // Get active cart only, return null if not found
  async findActiveByUserId(userId, client = null) {
    const executor = client || db;
    const result = await executor.query(
      `SELECT
         id,
         user_id,
         session_id,
         status,
         subtotal_amount,
         discount_amount,
         tax_amount,
         shipping_amount,
         final_amount,
         currency,
         last_validated_at,
         expires_at,
         created_at,
         updated_at
       FROM carts
       WHERE user_id = $1
         AND status = 'ACTIVE'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const cartRow = result.rows[0];
    const itemRows = await this._findCartItemsByCartId(cartRow.id, executor);
    return this._rowToCart(cartRow, itemRows);
  }

  // Create a new active cart for user
  async createActiveCart(userId, client = null) {
    const executor = client || db;
    const result = await executor.query(
      `INSERT INTO carts (user_id, status)
       VALUES ($1, 'ACTIVE')
       RETURNING
         id,
         user_id,
         session_id,
         status,
         subtotal_amount,
         discount_amount,
         tax_amount,
         shipping_amount,
         final_amount,
         currency,
         last_validated_at,
         expires_at,
         created_at,
         updated_at`,
      [userId]
    );

    return this._rowToCart(result.rows[0], []);
  }

  // Get cart by ID
  async findById(id) {
    const result = await db.query(
      `SELECT
         id,
         user_id,
         session_id,
         status,
         subtotal_amount,
         discount_amount,
         tax_amount,
         shipping_amount,
         final_amount,
         currency,
         last_validated_at,
         expires_at,
         created_at,
         updated_at
       FROM carts
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;

    const cartRow = result.rows[0];
    const itemRows = await this._findCartItemsByCartId(id);
    return this._rowToCart(cartRow, itemRows);
  }

  // Update cart (replace items and cart totals)
  async update(cart) {
    let client;
    try {
      client = await db.getClient();
      await client.query('BEGIN');

      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);

      for (const item of cart.items) {
        await client.query(
          `INSERT INTO cart_items (
             cart_id,
             product_variant_id,
             product_name,
             unit_price,
             quantity,
             tax_rate,
             tax_amount,
             line_total
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            cart.id,
            item.productVariantId,
            item.productName || 'Unknown product',
            item.unitPrice,
            item.quantity,
            item.taxRate || 0,
            item.taxAmount || 0,
            item.lineTotal
          ]
        );
      }

      await client.query(
        `UPDATE carts
         SET
           subtotal_amount = $1,
           discount_amount = $2,
           tax_amount = $3,
           shipping_amount = $4,
           final_amount = $5,
           last_validated_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $6`,
        [
          cart.subtotalAmount,
          cart.discountAmount,
          cart.taxAmount,
          cart.shippingAmount,
          cart.finalAmount,
          cart.id
        ]
      );

      await client.query('COMMIT');
      return await this.findById(cart.id);
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Clear cart
  async clear(userId) {
    const cart = await this.findByUserId(userId);
    cart.clear();
    return await this.update(cart);
  }

  async _findCartItemsByCartId(cartId, executor = db) {
    const itemResult = await executor.query(
      `SELECT
         ci.id,
         ci.product_variant_id AS "productVariantId",
         pv.product_id AS "productId",
         ci.product_name AS "productName",
         ci.unit_price AS "unitPrice",
         ci.quantity,
         ci.tax_rate AS "taxRate",
         ci.tax_amount AS "taxAmount",
         ci.line_total AS "lineTotal"
       FROM cart_items ci
       LEFT JOIN product_variant pv ON pv.id = ci.product_variant_id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at ASC`,
      [cartId]
    );

    return itemResult.rows;
  }

  _rowToCart(cartRow, itemRows = []) {
    const items = itemRows.map((item) => ({
      productVariantId: item.productVariantId,
      productId: item.productId || null,
      productName: item.productName,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      taxRate: Number(item.taxRate),
      taxAmount: Number(item.taxAmount),
      lineTotal: Number(item.lineTotal)
    }));

    return new Cart({
      id: cartRow.id,
      userId: cartRow.user_id,
      sessionId: cartRow.session_id,
      status: cartRow.status,
      currency: cartRow.currency,
      items,
      subtotalAmount: Number(cartRow.subtotal_amount),
      discountAmount: Number(cartRow.discount_amount),
      taxAmount: Number(cartRow.tax_amount),
      shippingAmount: Number(cartRow.shipping_amount),
      finalAmount: Number(cartRow.final_amount),
      lastValidatedAt: cartRow.last_validated_at,
      expiresAt: cartRow.expires_at,
      createdAt: cartRow.created_at,
      updatedAt: cartRow.updated_at
    });
  }
}

module.exports = new CartRepository();
