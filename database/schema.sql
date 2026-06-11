-- ===================================================
-- PROPERTY RENTAL MARKETPLACE - COMPLETE SCHEMA
-- Indian Rental Market Focus
-- ===================================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),
    profile_image VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    image VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    image VARCHAR(500),
    is_popular BOOLEAN DEFAULT false,
    property_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, state)
);

-- Create properties table (Indian rental focused)
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL DEFAULT 'apartment',
    category_id INTEGER REFERENCES categories(id),
    city_id INTEGER REFERENCES cities(id),
    
    -- Rental specific fields
    monthly_rent NUMERIC(10,2) NOT NULL,
    security_deposit NUMERIC(10,2) DEFAULT 0,
    maintenance NUMERIC(10,2) DEFAULT 0,
    bedrooms INTEGER NOT NULL DEFAULT 1,
    bathrooms NUMERIC(3,1) NOT NULL DEFAULT 1,
    area_sqft INTEGER,
    area_sqyd NUMERIC(10,2),
    
    -- Furnishing status
    furnishing VARCHAR(20) DEFAULT 'semi-furnished' CHECK (furnishing IN ('fully-furnished', 'semi-furnished', 'unfurnished')),
    
    -- Amenities as JSONB
    amenities JSONB DEFAULT '[]'::jsonb,
    
    -- Parking
    parking VARCHAR(20) DEFAULT 'none' CHECK (parking IN ('none', 'two-wheeler', 'four-wheeler', 'both')),
    
    -- Pet policy
    pet_friendly BOOLEAN DEFAULT false,
    
    -- Address
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    locality VARCHAR(255),
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    
    -- Location
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    
    -- Nearby places (JSONB)
    nearby_metro VARCHAR(255),
    nearby_schools JSONB DEFAULT '[]'::jsonb,
    nearby_hospitals JSONB DEFAULT '[]'::jsonb,
    nearby_malls JSONB DEFAULT '[]'::jsonb,
    
    -- Owner details
    owner_name VARCHAR(255),
    owner_phone VARCHAR(20),
    owner_email VARCHAR(255),
    
    -- Images
    images JSONB DEFAULT '[]'::jsonb,
    
    -- Status flags
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    guest_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id INTEGER REFERENCES users(id),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    monthly_rent NUMERIC(10,2) NOT NULL,
    security_deposit NUMERIC(10,2) DEFAULT 0,
    maintenance_fee NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    guest_count INTEGER NOT NULL DEFAULT 1,
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

-- Create or replace function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_city_id ON properties(city_id);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_rent ON properties(monthly_rent);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_furnishing ON properties(furnishing);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_properties_verified ON properties(is_verified) WHERE is_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_pet_friendly ON properties(pet_friendly) WHERE pet_friendly = TRUE;
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner ON bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_property ON wishlist(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_cities_popular ON cities(is_popular) WHERE is_popular = TRUE;

-- Create triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_properties_updated_at') THEN
        CREATE TRIGGER update_properties_updated_at
            BEFORE UPDATE ON properties
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at') THEN
        CREATE TRIGGER update_bookings_updated_at
            BEFORE UPDATE ON bookings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reviews_updated_at') THEN
        CREATE TRIGGER update_reviews_updated_at
            BEFORE UPDATE ON reviews
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- ===================================================
-- SEED DATA: Categories
-- ===================================================
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
('Apartment', 'apartment', 'Modern apartments in residential complexes', 'building', 1),
('Flat', 'flat', 'Comfortable flats in residential neighborhoods', 'home', 2),
('Villa', 'villa', 'Luxury villas with premium amenities', 'tree-pine', 3),
('Independent House', 'independent-house', 'Standalone houses with private yards', 'home', 4),
('Studio Apartment', 'studio-apartment', 'Compact studio apartments for singles and couples', 'maximize', 5),
('PG', 'pg', 'Paying guest accommodations for students and professionals', 'users', 6),
('Builder Floor', 'builder-floor', 'Independent floors in low-rise residential layouts', 'layers', 7),
('Farm House', 'farm-house', 'Spacious farmhouses on the outskirts', 'tractor', 8),
('Penthouse', 'penthouse', 'Premium penthouses with city views', 'building-2', 9),
('Office', 'office', 'Premium commercial office spaces', 'briefcase', 10),
('Shop', 'shop', 'Commercial retail shop spaces', 'shopping-bag', 11),
('Warehouse', 'warehouse', 'Industrial storage and warehouse spaces', 'warehouse', 12)
ON CONFLICT (name) DO NOTHING;

-- ===================================================
-- SEED DATA: Cities
-- ===================================================
INSERT INTO cities (name, state, slug, is_popular) VALUES
('Delhi', 'Delhi', 'delhi', true),
('Noida', 'Uttar Pradesh', 'noida', true),
('Greater Noida', 'Uttar Pradesh', 'greater-noida', true),
('Gurugram', 'Haryana', 'gurugram', true),
('Mumbai', 'Maharashtra', 'mumbai', true),
('Pune', 'Maharashtra', 'pune', true),
('Bangalore', 'Karnataka', 'bangalore', true),
('Hyderabad', 'Telangana', 'hyderabad', true),
('Chennai', 'Tamil Nadu', 'chennai', true),
('Kolkata', 'West Bengal', 'kolkata', true),
('Ahmedabad', 'Gujarat', 'ahmedabad', true),
('Jaipur', 'Rajasthan', 'jaipur', true),
('Lucknow', 'Uttar Pradesh', 'lucknow', true),
('Chandigarh', 'Chandigarh', 'chandigarh', true),
('Indore', 'Madhya Pradesh', 'indore', false),
('Bhopal', 'Madhya Pradesh', 'bhopal', false),
('Surat', 'Gujarat', 'surat', false),
('Visakhapatnam', 'Andhra Pradesh', 'visakhapatnam', false),
('Nagpur', 'Maharashtra', 'nagpur', false),
('Thane', 'Maharashtra', 'thane', false)
ON CONFLICT (name, state) DO NOTHING;

-- ===================================================
-- SEED DATA: Properties (Realistic Indian Properties)
-- ===================================================
-- Note: These will be inserted via the seed script with proper owner references