/**
 * Order Repository
 * Data Access Layer for Order operations (PostgreSQL)
 */

const db = require('../../config/database');
const Order = require('./Order');

class OrderRepository {
  // Get all orders
  async findAll(filters = {}) {
    let query = 'SELECT id, user_id, total_amount, status, shipping_address, payment_method, created_at, updated_at FROM orders WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(parseInt(filters.userId));
    }
    if (filters.status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }

    query += ' ORDER BY id';

    const result = await db.query(query, params);

    const orders = [];
    for (const row of result.rows) {
      const itemsResult = await db.query(
        `SELECT product_id AS "productId", quantity, price FROM order_items WHERE order_id = $1`,
        [row.id]
      );
      const items = itemsResult.rows.map(r => ({
        productId: r.productId,
        quantity: r.quantity,
        price: parseFloat(r.price)
      }));
      orders.push(this._rowToOrder(row, items));
    }
    return orders;
  }

  // Get order by ID
  async findById(id) {
    const result = await db.query(
      'SELECT id, user_id, total_amount, status, shipping_address, payment_method, created_at, updated_at FROM orders WHERE id = $1',
      [parseInt(id)]
    );
    if (result.rows.length === 0) return null;

    const itemsResult = await db.query(
      `SELECT product_id AS "productId", quantity, price FROM order_items WHERE order_id = $1`,
      [parseInt(id)]
    );
    const items = itemsResult.rows.map(r => ({
      productId: r.productId,
      quantity: r.quantity,
      price: parseFloat(r.price)
    }));

    return this._rowToOrder(result.rows[0], items);
  }

  // Create new order
  async create(orderData) {
    const validation = Order.validate(orderData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    let client;
    try {
      client = await db.getClient();
      await client.query('BEGIN');

      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, total_amount, status, shipping_address, payment_method, created_at, updated_at`,
        [
          orderData.userId,
          orderData.totalAmount,
          orderData.status || 'pending',
          JSON.stringify(orderData.shippingAddress || {}),
          orderData.paymentMethod || ''
        ]
      );

      const orderId = orderResult.rows[0].id;

      for (const item of orderData.items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.productId, item.quantity, item.price]
        );
      }

      await client.query('COMMIT');
      return this.findById(orderId);
    } catch (err) {
      if (client) await client.query('ROLLBACK');
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // Update order
  async update(id, orderData) {
    const existing = await this.findById(id);
    if (!existing) return null;

    await db.query(
      `UPDATE orders SET total_amount = $1, status = $2, shipping_address = $3, payment_method = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [
        orderData.totalAmount ?? existing.totalAmount,
        orderData.status ?? existing.status,
        JSON.stringify(orderData.shippingAddress ?? existing.shippingAddress),
        orderData.paymentMethod ?? existing.paymentMethod,
        parseInt(id)
      ]
    );

    return this.findById(id);
  }

  // Update order status
  async updateStatus(id, status) {
    return this.update(id, { status });
  }

  // Delete order
  async delete(id) {
    const result = await db.query('DELETE FROM orders WHERE id = $1 RETURNING id', [parseInt(id)]);
    return result.rowCount > 0;
  }

  _rowToOrder(row, items = []) {
    return new Order({
      id: row.id,
      userId: row.user_id,
      items,
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      shippingAddress: typeof row.shipping_address === 'object' ? row.shipping_address : (row.shipping_address ? JSON.parse(row.shipping_address) : {}),
      paymentMethod: row.payment_method,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
}

module.exports = new OrderRepository();
