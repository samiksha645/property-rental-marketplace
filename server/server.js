require('dotenv').config();
const app = require('./src/app');
const { pool, query } = require('./src/config/database');
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
    const adminEmail = 'admin@rentalmarketplace.com';
    const adminPassword = 'admin123';
    
    // Hash password fresh
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Upsert admin user - update password if exists, insert if not
    const upsertSql = `
      INSERT INTO users (name, email, password, role, is_active, is_email_verified)
      VALUES ($1, $2, $3, 'admin', true, true)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password = CASE 
          WHEN users.password IS NULL OR users.password = '' THEN $3
          ELSE $3
        END,
        is_active = true,
        is_email_verified = true,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, name, email, role;
    `;
    
    const result = await query(upsertSql, [
      'Admin User',
      adminEmail,
      hashedPassword,
    ]);
    
    // Verify the password was stored correctly by reading it back
    const verifySql = `SELECT id, email, password, role FROM users WHERE email = $1`;
    const verifyResult = await query(verifySql, [adminEmail]);
    
    if (verifyResult.rows.length > 0) {
      const storedUser = verifyResult.rows[0];
      // Verify bcrypt hash works
      const isValid = await bcrypt.compare(adminPassword, storedUser.password);
      
      if (isValid) {
        console.log(`✅ Admin user ready: ${storedUser.email} (role: ${storedUser.role}, id: ${storedUser.id})`);
        console.log(`   Password hash verification: PASSED`);
      } else {
        console.error(`❌ Admin password hash VERIFICATION FAILED!`);
        // Force update with a known working hash
        const newSalt = await bcrypt.genSalt(12);
        const newHash = await bcrypt.hash(adminPassword, newSalt);
        await query(`UPDATE users SET password = $1 WHERE email = $2`, [newHash, adminEmail]);
        console.log(`   Hash forcefully updated.`);
      }
    } else {
      console.error(`❌ Admin user creation FAILED - user not found after insert.`);
    }
  } catch (err) {
    console.error('⚠️  Admin user initialization error:', err.message);
    console.error(err.stack);
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
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database or start the server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

startServer();