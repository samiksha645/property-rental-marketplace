-- Migration 001: Create users table for authentication system
-- Created: 2026-06-06
-- This migration creates the core users table with all necessary columns

-- Drop table if exists and recreate to ensure clean state
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with complete schema
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    phone VARCHAR(20),
    profile_image VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger for updating updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
INSERT INTO users (name, email, password, role, is_email_verified, created_at, updated_at)
VALUES (
    'Admin User',
    'admin@rentalmarketplace.com',
    '$2b$12$LUIuhL0FLhF8q7MqQ3W7h.vZ9KxJLxJxJxJxJxJxJxJxJxJxJxJxJ',
    'admin',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Add foreign key to properties table for landlord_id
-- Note: This assumes landlord_id in properties references users.id
-- If properties table already exists, run this:
ALTER TABLE properties 
ADD CONSTRAINT fk_properties_landlord 
FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE;

-- Insert default admin user (password: admin123)
-- IMPORTANT: Change this password in production!
INSERT INTO users (name, email, password, role, is_email_verified) 
VALUES (
    'Admin User',
    'admin@rentalmarketplace.com',
    '$2a$12$LUIuhL0FLhF8q7MqQ3W7h.vZ9KxJLxJxJxJxJxJxJxJxJxJxJxJxJ',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Comment: The default admin password hash above is a placeholder
-- Run the seed script to set a proper password