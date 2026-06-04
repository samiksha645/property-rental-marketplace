require('dotenv').config();
const app = require('./src/app');
const { pool } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL ERROR: DATABASE_URL environment variable is missing.');
  console.error('👉 If deploying to Render, please add DATABASE_URL to your Environment Variables.');
  process.exit(1);
}

// Test DB Connection and Start Server
async function startServer() {
  try {
    // Quick test to make sure database pool works
    const res = await pool.query('SELECT NOW()');
    console.log(`✅ DB connection test succeeded: ${res.rows[0].now}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database or start the server:', error.message);
    process.exit(1);
  }
}

startServer();
