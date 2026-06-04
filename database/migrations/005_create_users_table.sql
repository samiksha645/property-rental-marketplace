CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert mock users for any existing landlords or guests to prevent foreign key errors
INSERT INTO users (id, name, email, role)
SELECT DISTINCT landlord_id, 'Landlord ' || landlord_id, 'landlord' || landlord_id || '@example.com', 'user'
FROM properties
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, email, role)
SELECT DISTINCT guest_id, 'Guest ' || guest_id, 'guest' || guest_id || '@example.com', 'user'
FROM bookings
ON CONFLICT (id) DO NOTHING;

-- Also insert the default guest user
INSERT INTO users (id, name, email, role) VALUES (1, 'John Doe', 'guest@example.com', 'admin') ON CONFLICT DO NOTHING;

-- Add foreign key constraints to properties and bookings
ALTER TABLE properties 
ADD CONSTRAINT fk_landlord 
FOREIGN KEY (landlord_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

ALTER TABLE bookings 
ADD CONSTRAINT fk_guest 
FOREIGN KEY (guest_id) 
REFERENCES users(id) 
ON DELETE CASCADE;
