-- Seed sample data
-- Run after schema.sql

INSERT INTO products (name, description, price, stock, category)
SELECT 'Laptop', 'High-performance laptop', 999.99, 10, 'Electronics'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Laptop' LIMIT 1);

INSERT INTO products (name, description, price, stock, category)
SELECT 'Smartphone', 'Latest smartphone model', 699.99, 25, 'Electronics'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Smartphone' LIMIT 1);

-- Only insert admin user if no users exist (password placeholder - replace with bcrypt hash)
INSERT INTO users (email, password, name, role)
SELECT 'admin@example.com', '$2a$10$rOzJqXJqXJqXJqXJqXJqXO', 'Admin User', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);
