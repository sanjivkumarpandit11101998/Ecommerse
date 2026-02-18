/**
 * User Repository
 * Data Access Layer for User operations (PostgreSQL)
 */

const db = require('../../config/database');
const User = require('./User');

class UserRepository {
  // Get all users
  async findAll() {
    const result = await db.query(
      'SELECT id, email, password, name, role, address, created_at, updated_at FROM users ORDER BY id'
    );
    return result.rows.map(row => this._rowToUser(row));
  }

  // Get user by ID
  async findById(id) {
    const result = await db.query(
      'SELECT id, email, password, name, role, address, created_at, updated_at FROM users WHERE id = $1',
      [parseInt(id)]
    );
    return result.rows[0] ? this._rowToUser(result.rows[0]) : null;
  }

  // Get user by email
  async findByEmail(email) {
    const result = await db.query(
      'SELECT id, email, password, name, role, address, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] ? this._rowToUser(result.rows[0]) : null;
  }

  // Create new user
  async create(userData) {
    if (await this.findByEmail(userData.email)) {
      throw new Error('Email already exists');
    }

    const validation = User.validate(userData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const result = await db.query(
      `INSERT INTO users (email, password, name, role, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, password, name, role, address, created_at, updated_at`,
      [
        userData.email,
        userData.password,
        userData.name || '',
        userData.role || 'customer',
        JSON.stringify(userData.address || {})
      ]
    );
    return this._rowToUser(result.rows[0]);
  }

  // Update user
  async update(id, userData) {
    const existing = await this.findById(id);
    if (!existing) return null;

    if (userData.email && userData.email !== existing.email) {
      if (await this.findByEmail(userData.email)) {
        throw new Error('Email already exists');
      }
    }

    const updatedUser = { ...existing.toJSON(), ...userData, id: parseInt(id) };
    if (userData.password) {
      const validation = User.validate(updatedUser);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
    }

    await db.query(
      `UPDATE users SET email = $1, name = $2, role = $3, address = $4, updated_at = CURRENT_TIMESTAMP
       ${userData.password ? ', password = $6' : ''}
       WHERE id = $5`,
      userData.password
        ? [userData.email || existing.email, userData.name ?? existing.name, userData.role ?? existing.role, JSON.stringify(userData.address ?? existing.address), parseInt(id), userData.password]
        : [userData.email || existing.email, userData.name ?? existing.name, userData.role ?? existing.role, JSON.stringify(userData.address ?? existing.address), parseInt(id)]
    );

    return this.findById(id);
  }

  // Delete user
  async delete(id) {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [parseInt(id)]);
    return result.rowCount > 0;
  }

  _rowToUser(row) {
    return new User({
      id: row.id,
      email: row.email,
      password: row.password,
      name: row.name,
      role: row.role,
      address: typeof row.address === 'object' ? row.address : (row.address ? JSON.parse(row.address) : {}),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
}

module.exports = new UserRepository();
