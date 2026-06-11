require('dotenv').config({ path: 'server/.env' });
const { query } = require('./server/src/config/database');

(async () => {
  try {
    console.log('🗑️  Deleting corrupted admin user...');
    const deleteResult = await query(
      'DELETE FROM users WHERE email = $1',
      ['admin@rentalmarketplace.com']
    );
    console.log('✅ Deleted', deleteResult.rowCount, 'user(s)');
    
    console.log('\n✨ Restarting server to recreate admin user...');
    console.log('The server will automatically create a fresh admin user with valid password hash');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
