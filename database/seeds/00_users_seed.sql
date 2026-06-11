-- Seed default landlord user with id = 1 if it doesn't exist
INSERT INTO users (id, name, email, password, role, is_active, is_email_verified)
VALUES (
  1, 
  'Default Landlord', 
  'landlord@rentalmarketplace.com', 
  '$2y$12$K1r6fC0zTqY2sC5k1y2sCe3qY2sC5k1y2sCe3qY2sC5k1y2sCe3qY', -- bcrypt hash for 'password123'
  'user', 
  true, 
  true
)
ON CONFLICT (id) DO NOTHING;

-- Reset the auto-increment sequence for users so future inserts don't conflict
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), true);
