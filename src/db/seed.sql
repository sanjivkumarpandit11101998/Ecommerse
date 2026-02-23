-- Seed sample data
-- Run after schema.sql

-- ===========================
-- CATEGORY
-- ===========================

INSERT INTO category (id, name, slug)
VALUES 
('11111111-1111-4111-8111-111111111111', 'Mobiles', 'mobiles');


-- ===========================
-- BRAND
-- ===========================

INSERT INTO brand (id, name, logo_url, description)
VALUES 
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
 'Samsung', 
 'https://logo.com/samsung.png', 
 'Samsung Electronics');


-- ===========================
-- PRODUCT
-- ===========================

INSERT INTO product (
    id, 
    name, 
    slug, 
    short_description, 
    description, 
    base_price, 
    brand_id, 
    category_id, 
    status, 
    is_featured
)
VALUES (
    '99999999-9999-4999-8999-999999999999',
    'Samsung Galaxy S25',
    'samsung-galaxy-s25',
    'Latest Samsung flagship phone',
    'Samsung Galaxy S25 with powerful processor and stunning display.',
    79999.00,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'ACTIVE',
    TRUE
);


-- ===========================
-- PRODUCT IMAGES
-- ===========================

INSERT INTO product_image (
    product_id, image_url, is_primary, sort_order
)
VALUES 
('99999999-9999-4999-8999-999999999999',
 'https://store.com/images/s25-front.jpg',
 TRUE,
 1),

('99999999-9999-4999-8999-999999999999',
 'https://store.com/images/s25-back.jpg',
 FALSE,
 2);


-- ===========================
-- PRODUCT VARIANTS
-- ===========================

INSERT INTO product_variant (
    id,
    product_id,
    sku,
    attribute_name,
    attribute_value,
    price
)
VALUES
('22222222-2222-4222-8222-222222222222',
 '99999999-9999-4999-8999-999999999999',
 'S25-128GB',
 'Storage',
 '128GB',
 79999.00),

('33333333-3333-4333-8333-333333333333',
 '99999999-9999-4999-8999-999999999999',
 'S25-256GB',
 'Storage',
 '256GB',
 84999.00);


-- ===========================
-- PRODUCT SPECIFICATION (JSONB)
-- ===========================

INSERT INTO product_specification (
    product_id,
    specifications
)
VALUES (
    '99999999-9999-4999-8999-999999999999',
    '{
        "Battery & Power": {
            "Battery Capacity": "6000 mAh",
            "Battery Type": "Lithium Ion"
        },
        "Display": {
            "Display Size": "6.7 inch",
            "Refresh Rate": "120 Hz"
        },
        "Processor": {
            "Chipset": "Snapdragon 8 Gen 3",
            "RAM": "12GB"
        }
    }'
);


-- ===========================
-- REVIEWS
-- ===========================

INSERT INTO review (
    product_id,
    user_id,
    rating,
    comment
)
VALUES 
('99999999-9999-4999-8999-999999999999',
 '44444444-4444-4444-8444-444444444444',
 5,
 'Amazing performance and battery life!'),

('99999999-9999-4999-8999-999999999999',
 '55555555-5555-4555-8555-555555555555',
 4,
 'Great phone but slightly expensive.');


-- Only insert admin user if no users exist (password placeholder - replace with bcrypt hash)
INSERT INTO users (email, password, name, role)
SELECT 'admin@example.com', '$2a$10$rOzJqXJqXJqXJqXJqXJqXO', 'Admin User', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);
