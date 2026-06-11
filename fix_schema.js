require('dotenv').config({ path: require('path').join(__dirname, 'server', '.env') });
const { pool } = require('./server/src/config/database');

async function fixAll() {
  const client = await pool.connect();
  try {
    console.log('🔧 Starting comprehensive fixes...\n');

    // 1. Check if owner_id exists in properties
    const checkOwner = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'properties' AND column_name = 'owner_id'
    `);
    
    if (checkOwner.rows.length === 0) {
      console.log('❌ owner_id missing from properties table. Checking for landlord_id...');
      
      const checkLandlord = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'landlord_id'
      `);
      
      if (checkLandlord.rows.length > 0) {
        console.log('✅ Found landlord_id, renaming to owner_id...');
        await client.query('ALTER TABLE properties RENAME COLUMN landlord_id TO owner_id');
        console.log('✅ Renamed landlord_id -> owner_id');
      } else {
        console.log('❌ Neither owner_id nor landlord_id found. Adding owner_id...');
        await client.query(`
          ALTER TABLE properties 
          ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE
        `);
        console.log('✅ Added owner_id column');
      }
    } else {
      console.log('✅ owner_id column exists');
    }

    // 2. Check if properties table has all needed columns
    const propCols = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'properties'
    `);
    console.log('✅ Properties columns:', propCols.rows.map(r => r.column_name).join(', '));

    // 3. Check if properties exist
    const propCount = await client.query('SELECT COUNT(*) FROM properties');
    console.log(`📊 Properties in DB: ${propCount.rows[0].count}`);

    // 4. Check if cities exist
    const cityCount = await client.query('SELECT COUNT(*) FROM cities');
    console.log(`📊 Cities in DB: ${cityCount.rows[0].count}`);

    // 5. Check if categories exist
    const catCount = await client.query('SELECT COUNT(*) FROM categories');
    console.log(`📊 Categories in DB: ${catCount.rows[0].count}`);

    // 6. Check bookings table columns
    const bookingCheck = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings'
    `);
    console.log('📊 Booking columns:', bookingCheck.rows.map(r => r.column_name).join(', '));

    // 7. Migrate missing columns if needed
    // Check if properties have is_verified
    const hasVerified = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'properties' AND column_name = 'is_verified'
    `);
    if (hasVerified.rows.length === 0) {
      console.log('❌ is_verified missing, adding...');
      await client.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false`);
      console.log('✅ Added is_verified');
    } else {
      console.log('✅ is_verified exists');
    }

    // Check if properties have category_id
    const hasCatId = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'properties' AND column_name = 'category_id'
    `);
    if (hasCatId.rows.length === 0) {
      console.log('❌ category_id missing, adding...');
      await client.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id)`);
      console.log('✅ Added category_id');
    } else {
      console.log('✅ category_id exists');
    }

    // Check if properties have city_id
    const hasCityId = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'properties' AND column_name = 'city_id'
    `);
    if (hasCityId.rows.length === 0) {
      console.log('❌ city_id missing, adding...');
      await client.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS city_id INTEGER REFERENCES cities(id)`);
      console.log('✅ Added city_id');
    } else {
      console.log('✅ city_id exists');
    }

    // 8. Update property counts in cities
    await client.query(`
      UPDATE cities c SET property_count = (
        SELECT COUNT(*) FROM properties p WHERE p.city_id = c.id AND p.is_active = true
      )
    `);
    console.log('✅ Updated property counts in cities');

    // 9. Check admin user exists
    const adminCheck = await client.query("SELECT id, email, role FROM users WHERE email = 'admin@rentalmarketplace.com'");
    if (adminCheck.rows.length > 0) {
      console.log(`✅ Admin user: ${adminCheck.rows[0].email} (role: ${adminCheck.rows[0].role}, id: ${adminCheck.rows[0].id})`);
      
      // Make sure properties reference the admin as owner if needed
      const orphanProps = await client.query('SELECT COUNT(*) FROM properties WHERE owner_id IS NULL');
      if (parseInt(orphanProps.rows[0].count) > 0) {
        console.log(`⚠️ ${orphanProps.rows[0].count} properties have no owner_id, fixing...`);
        await client.query('UPDATE properties SET owner_id = $1 WHERE owner_id IS NULL', [adminCheck.rows[0].id]);
        console.log('✅ Fixed orphan properties');
      }
    } else {
      console.log('❌ Admin user not found');
    }

    // 10. Test a property query
    const testQuery = await client.query(`
      SELECT p.id, p.title, p.city, p.owner_id, p.monthly_rent, 
        c.name as city_name, ct.name as category_name,
        u.name as owner_name
      FROM properties p
      LEFT JOIN cities c ON p.city_id = c.id
      LEFT JOIN categories ct ON p.category_id = ct.id
      LEFT JOIN users u ON p.owner_id = u.id
      LIMIT 5
    `);
    console.log('\n📋 Test query results:');
    testQuery.rows.forEach(r => {
      console.log(`  ID: ${r.id} | ${r.title} | City: ${r.city_name || r.city} | Owner: ${r.owner_name || 'N/A'}`);
    });

    // 11. Test admin bookings query
    const bookingTest = await client.query(`
      SELECT b.*, p.title as property_title,
             u.name as guest_name, u.email as guest_email,
             ow.name as owner_name, ow.email as owner_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      LEFT JOIN users ow ON p.owner_id = ow.id
      LIMIT 3
    `);
    console.log(`\n📋 Booking join test: ${bookingTest.rows.length} results`);

    console.log('\n✅ All diagnostics and fixes complete!');
  } catch (err) {
    console.error('❌ Fix error:', err.message);
    console.error(err.stack);
  } finally {
    client.release();
    pool.end();
  }
}

fixAll();