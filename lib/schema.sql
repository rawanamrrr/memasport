-- PostgreSQL Database Schema for Mema Sports

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    role VARCHAR(50) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    long_description TEXT,
    images TEXT[], -- Array of image URLs
    rating DECIMAL(3,2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_new BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_gift_package BOOLEAN DEFAULT FALSE,
    package_price DECIMAL(10,2),
    package_original_price DECIMAL(10,2),
    notes JSONB, -- Store top/middle/base notes as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product sizes table
CREATE TABLE IF NOT EXISTS product_sizes (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(50) NOT NULL,
    volume VARCHAR(50) NOT NULL,
    original_price DECIMAL(10,2),
    discounted_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gift package sizes table
CREATE TABLE IF NOT EXISTS gift_package_sizes (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(50) NOT NULL,
    volume VARCHAR(50) NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    city VARCHAR(100),
    governorate VARCHAR(100),
    postal_code VARCHAR(20),
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    discount_code VARCHAR(50),
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'cash_on_delivery',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(255),
    product_name VARCHAR(255) NOT NULL,
    size VARCHAR(50),
    volume VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    quantity INTEGER NOT NULL,
    image VARCHAR(500),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500),
    category VARCHAR(50),
    rating DECIMAL(3,2),
    is_new BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_gift_package BOOLEAN DEFAULT FALSE,
    package_price DECIMAL(10,2),
    package_original_price DECIMAL(10,2),
    sizes JSONB,
    gift_package_sizes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed', or 'buyXgetX'
    value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    buy_x INTEGER,
    get_x INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offers table (promotional banners shown site-wide)
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT NOT NULL,
    discount_code VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(is_active, category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_offers_active_priority ON offers(is_active, priority DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON discount_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
