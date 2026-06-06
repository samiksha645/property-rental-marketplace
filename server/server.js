require('dotenv').config();
const app = require('./src/app');
const { pool } = require('./src/config/database');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 5000;

if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL ERROR: DATABASE_URL environment variable is missing.');
  console.error('👉 If deploying to Render, please add DATABASE_URL to your Environment Variables.');
  process.exit(1);
}

// Initialize Default Admin User
async function initializeAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const query = `
      INSERT INTO users (name, email, password, role, is_active, is_email_verified)
      VALUES ($1, $2, $3, $4, true, true)
      ON CONFLICT (email) DO NOTHING;
    `;
    
    const result = await pool.query(query, [
      'Admin User',
      'admin@rentalmarketplace.com',
      hashedPassword,
      'admin'
    ]);
    
    if (result.rowCount > 0) {
      console.log('✅ Default admin user created successfully');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (err) {
    console.error('⚠️  Admin user initialization error:', err.message);
    // Don't fail startup if admin creation fails
  }
}

// Test DB Connection and Start Server
async function startServer() {
  try {
    // Quick test to make sure database pool works
    const res = await pool.query('SELECT NOW()');
    console.log(`✅ DB connection test succeeded: ${res.rows[0].now}`);

    // Initialize admin user on startup
    await initializeAdminUser();

    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database or start the server:', error.message);
    process.exit(1);
  }
}

startServer();
