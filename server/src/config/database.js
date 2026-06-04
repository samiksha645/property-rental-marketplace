const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || '';
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString: connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Removed repetitive pool connect logging as it fires for every single connection in the pool, 
// creating log spam. Connection is verified once on startup in server.js instead.

pool.on('error', (err) => {
  console.error('⚠️ Unexpected error on idle database client:', err.message);
  // Do NOT process.exit() here! Cloud databases (like Supabase) frequently close idle connections.
  // The pg pool will automatically create a new client when a query is made.
});

// Wrapper for queries with error handling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('Database query error:', { text, error: error.message });
    throw error;
  }
};

module.exports = { pool, query };