-- Migration 004: Add indexes for properties table performance
-- These indexes improve query performance for common searches

CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(base_price_per_night);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_properties_landlord ON properties(landlord_id);
