require('dotenv').config({ path: 'server/.env' });
const { query } = require('./server/src/config/database');

(async () => {
  try {
    const result = await query(
      'SELECT id, name, email, role, is_active, password FROM users WHERE email = $1',
      ['admin@rentalmarketplace.com']
    );

    if (result.rows.length > 0) {
      console.log('✅ Admin user found:');
      console.log(JSON.stringify(result.rows[0], null, 2));
      
      // Test password hash
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare('admin123', result.rows[0].password);
      console.log('\n🔐 Password verification:', isValid ? '✅ VALID' : '❌ INVALID');
    } else {
      console.log('❌ Admin user not found');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
