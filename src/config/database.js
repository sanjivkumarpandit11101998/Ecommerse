/**
 * PostgreSQL Database Configuration
 * Connection pool and query helper
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'ecommerce_db',
  user: process.env.DATABASE_URL ? undefined : (process.env.DB_USER || 'postgres'),
  password: process.env.DATABASE_URL ? undefined : (process.env.DB_PASSWORD || ''),
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    throw err;
  }
}

async function getClient() {
  return pool.connect();
}

async function close() {
  await pool.end();
}

module.exports = {
  query,
  getClient,
  pool,
  close
};
