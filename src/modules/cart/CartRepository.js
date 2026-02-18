/**
 * Cart Repository
 * Data Access Layer for Cart operations (PostgreSQL)
 */

const db = require('../../config/database');
const Cart = require('./Cart');

class CartRepository {
  // Get cart by user ID (creates if doesn't exist)
  async findByUserId(userId) {
    let client;
    try {
      client = await db.getClient();
      let result = await client.query(
        'SELECT id, user_id, created_at, updated_at FROM carts WHERE user_id = $1',
        [parseInt(userId)]
      );

      let cartId;
      if (result.rows.length === 0) {
        const insertResult = await client.query(
          'INSERT INTO carts (user_id) VALUES ($1) RETURNING id, user_id, created_at, updated_at',
          [parseInt(userId)]
        );
        cartId = insertResult.rows[0].id;
        result = insertResult;
      } else {
        cartId = result.rows[0].id;
      }

      const itemsResult = await client.query(
        `SELECT ci.id, ci.product_id AS "productId", ci.quantity, ci.price
         FROM cart_items ci WHERE ci.cart_id = $1`,
        [cartId]
      );

      const cart = result.rows[0];
      const items = itemsResult.rows.map(r => ({
        productId: r.productId,
        quantity: r.quantity,
        price: parseFloat(r.price)
      }));

      return new Cart({
        id: cart.id,
        userId: cart.user_id,
        items,
        createdAt: cart.created_at,
        updatedAt: cart.updated_at
      });
    } finally {
      if (client) client.release();
    }
  }

  // Get cart by ID
  async findById(id) {
    const result = await db.query(
      'SELECT id, user_id, created_at, updated_at FROM carts WHERE id = $1',
      [parseInt(id)]
    );
    if (result.rows.length === 0) return null;

    const itemsResult = await db.query(
      `SELECT product_id AS "productId", quantity, price FROM cart_items WHERE cart_id = $1`,
      [parseInt(id)]
    );

    const cart = result.rows[0];
    const items = itemsResult.rows.map(r => ({
      productId: r.productId,
      quantity: r.quantity,
      price: parseFloat(r.price)
    }));

    return new Cart({
      id: cart.id,
      userId: cart.user_id,
      items,
      createdAt: cart.created_at,
      updatedAt: cart.updated_at
    });
  }

  // Update cart (replace items)
  async update(cart) {
    let client;
    try {
      client = await db.getClient();
      await client.query('BEGIN');

      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);

      for (const item of cart.items) {
        await client.query(
          `INSERT INTO cart_items (cart_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [cart.id, item.productId, item.quantity, item.price]
        );
      }

      await client.query(
        'UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [cart.id]
      );

      await client.query('COMMIT');
      return this.findById(cart.id);
    } catch (err) {
      if (client) await client.query('ROLLBACK');
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // Clear cart
  async clear(userId) {
    const cart = await this.findByUserId(userId);
    cart.clear();
    return this.update(cart);
  }
}

module.exports = new CartRepository();
