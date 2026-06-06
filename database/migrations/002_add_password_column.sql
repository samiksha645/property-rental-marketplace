-- Migration: Add missing columns to users table
-- This fixes the "column password does not exist" error
-- Created: 2026-06-06

-- Add password column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT '';

-- Add role column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user' 
CHECK (role IN ('user', 'admin'));

-- Add phone column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add profile_image column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500);

-- Add is_active column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add is_email_verified column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;

-- Add last_login column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Add updated_at column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update existing users with a temporary password
-- They will need to use "forgot password" functionality
UPDATE users 
SET password = '$2a$12$LUIuhL0FLhF8q7MqQ3W7h.vZ9KxJLxJxJxJxJxJxJxJxJxJxJxJxJ' 
WHERE password = '' OR password IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Insert default admin user if not exists
INSERT INTO users (name, email, password, role, is_email_verified) 
VALUES (
    'Admin User',
    'admin@rentalmarketplace.com',
    '$2a$12$LUIuhL0FLhF8q7MqQ3W7h.vZ9KxJLxJxJxJxJxJxJxJxJxJxJxJxJ',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;