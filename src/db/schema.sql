-- Ecommerce Database Schema
-- Run this script to create all tables

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) DEFAULT '',
  role VARCHAR(50) DEFAULT 'customer',
  address JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    parent_id UUID REFERENCES category(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS brand (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    logo_url TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS product (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    base_price NUMERIC(10,2) NOT NULL,
    brand_id UUID REFERENCES brand(id) ON DELETE SET NULL,
    category_id UUID REFERENCES category(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    is_featured BOOLEAN DEFAULT FALSE,
    average_rating NUMERIC(2,1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS product_image (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES product(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0
);


CREATE TABLE IF NOT EXISTS product_variant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES product(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    attribute_name VARCHAR(100),
    attribute_value VARCHAR(100),
    price NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_specification (
    product_id UUID PRIMARY KEY 
        REFERENCES product(id) ON DELETE CASCADE,
    specifications JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES product(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS idx_product_category ON product(category_id);
CREATE INDEX IF NOT EXISTS idx_product_brand ON product(brand_id);
CREATE INDEX IF NOT EXISTS idx_product_price ON product(base_price);
CREATE INDEX IF NOT EXISTS idx_product_slug ON product(slug);

---------- Carts --------------------------


CREATE TABLE carts (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                       user_id UUID NULL,               -- Logged-in user
                       session_id VARCHAR(100) NULL,    -- Guest user

                       status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    -- ACTIVE, ABANDONED, ORDERED, EXPIRED

                       subtotal_amount NUMERIC(12,2) NOT NULL DEFAULT 0,    -- sum of item line totals
                       discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,    -- total cart discount
                       tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,         -- sum of all item taxes
                       shipping_amount NUMERIC(12,2) NOT NULL DEFAULT 0,    -- shipping cost
                       final_amount NUMERIC(12,2) NOT NULL DEFAULT 0,       -- subtotal - discount + tax + shipping

                       currency VARCHAR(10) NOT NULL DEFAULT 'INR',

                       last_validated_at TIMESTAMP NULL,  -- last time cart was recalculated
                       expires_at TIMESTAMP NULL,         -- when cart should auto-expire

                       created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                       updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE cart_items (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                            cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
                            product_variant_id UUID NOT NULL,           -- product reference
                            product_name VARCHAR(255) NOT NULL,
                            unit_price NUMERIC(12,2) NOT NULL,  -- price per unit (tax-inclusive or exclusive)
                            quantity INT NOT NULL DEFAULT 1,

                            tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,       -- % tax for this item
                            tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,    -- calculated tax for this line
                            line_total NUMERIC(12,2) NOT NULL DEFAULT 0,    -- unit_price * quantity

                            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE coupons (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         code VARCHAR(50) UNIQUE NOT NULL,
                         type VARCHAR(20) NOT NULL,           -- ITEM, CART, PAYMENT
                         discount_type VARCHAR(20) NOT NULL,  -- PERCENTAGE, FIXED
                         discount_value NUMERIC(12,2) NOT NULL,
                         min_cart_value NUMERIC(12,2) NULL,
                         max_discount_value NUMERIC(12,2) NULL,
                         valid_from TIMESTAMP NOT NULL,
                         valid_to TIMESTAMP NOT NULL,
                         usage_limit INT NULL,
                         per_user_limit INT NULL,
                         created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                         updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code VARCHAR(50) UNIQUE NOT NULL,
        -- CREDIT_CARD, DEBIT_CARD, UPI, WALLET, EMI

    name VARCHAR(100) NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE coupon_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    coupon_id UUID NOT NULL 
        REFERENCES coupons(id) ON DELETE CASCADE,

    payment_method_id UUID NOT NULL 
        REFERENCES payment_methods(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(coupon_id, payment_method_id)
);


--------------------------------

-------------- Orders --------------------------
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_address JSONB DEFAULT '{}',
  payment_method VARCHAR(100) DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);


--------------------------------


--------------------------------

