CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (id, name, email, role) VALUES (1, 'John Doe', 'admin@example.com', 'admin') ON CONFLICT (id) DO NOTHING;

-- Insert mock users for any existing landlords to prevent FK errors
INSERT INTO users (id, name, email, role)
SELECT DISTINCT landlord_id, 'Landlord ' || landlord_id, 'landlord' || landlord_id || '@example.com', 'user'
FROM properties
WHERE landlord_id IS NOT NULL AND landlord_id != 1
ON CONFLICT (id) DO NOTHING;

-- Insert mock users for any existing guests to prevent FK errors
INSERT INTO users (id, name, email, role)
SELECT DISTINCT guest_id, 'Guest ' || guest_id, 'guest' || guest_id || '@example.com', 'user'
FROM bookings
WHERE guest_id IS NOT NULL AND guest_id != 1
ON CONFLICT (id) DO NOTHING;

-- Add foreign key constraints (only if they don't already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_landlord') THEN
    ALTER TABLE properties ADD CONSTRAINT fk_landlord FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_guest') THEN
    ALTER TABLE bookings ADD CONSTRAINT fk_guest FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;
