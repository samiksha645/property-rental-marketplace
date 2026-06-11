const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { pool } = require('../server/src/config/database');

const citiesInfo = [
  { name: 'Delhi', state: 'Delhi', pincodes: ['110001', '110024', '110075', '110016'] },
  { name: 'Noida', state: 'Uttar Pradesh', pincodes: ['201301', '201303', '201304'] },
  { name: 'Greater Noida', state: 'Uttar Pradesh', pincodes: ['201308', '201310'] },
  { name: 'Gurugram', state: 'Haryana', pincodes: ['122001', '122002', '122018'] },
  { name: 'Mumbai', state: 'Maharashtra', pincodes: ['400001', '400050', '400093', '400011'] },
  { name: 'Pune', state: 'Maharashtra', pincodes: ['411001', '411007', '411057'] },
  { name: 'Bangalore', state: 'Karnataka', pincodes: ['560001', '560038', '560066', '560100'] },
  { name: 'Hyderabad', state: 'Telangana', pincodes: ['500001', '500032', '500081'] },
  { name: 'Chennai', state: 'Tamil Nadu', pincodes: ['600001', '600020', '600097'] },
  { name: 'Kolkata', state: 'West Bengal', pincodes: ['700001', '700016', '700091'] },
  { name: 'Jaipur', state: 'Rajasthan', pincodes: ['302001', '302015', '302021'] },
  { name: 'Chandigarh', state: 'Chandigarh', pincodes: ['160017', '160022', '160036'] },
  { name: 'Ahmedabad', state: 'Gujarat', pincodes: ['380001', '380009', '380054'] },
  { name: 'Lucknow', state: 'Uttar Pradesh', pincodes: ['226001', '226010', '226024'] }
];

const propertyTypes = [
  'apartment', 'flat', 'villa', 'independent-house', 'studio', 'pg-hostel', 
  'builder-floor', 'farmhouse', 'penthouse', 'office', 'shop', 'warehouse'
];

const localities = {
  'Delhi': ['Dwarka', 'Lajpat Nagar', 'Connaught Place', 'Saket', 'Vasant Kunj', 'Karol Bagh'],
  'Noida': ['Sector 62', 'Sector 18', 'Sector 15', 'Sector 50', 'Sector 76'],
  'Greater Noida': ['Alpha 1', 'Beta 2', 'Omega 3', 'Knowledge Park', 'Sector 4'],
  'Gurugram': ['DLF Phase 3', 'Sushant Lok', 'Sector 56', 'Golf Course Road', 'Sohna Road'],
  'Mumbai': ['Bandra West', 'Andheri East', 'Colaba', 'Juhu', 'Worli', 'Goregaon'],
  'Pune': ['Hinjewadi', 'Kharadi', 'Koregaon Park', 'Kothrud', 'Viman Nagar'],
  'Bangalore': ['Whitefield', 'Indiranagar', 'Electronic City', 'Koramangala', 'HSR Layout'],
  'Hyderabad': ['Gachibowli', 'Jubilee Hills', 'HITEC City', 'Madhapur', 'Banjara Hills'],
  'Chennai': ['Adyar', 'OMR Thoraipakkam', 'Velachery', 'T Nagar', 'Anna Nagar'],
  'Kolkata': ['Salt Lake Sec 5', 'Park Street', 'New Town', 'Ballygunge', 'Tollygunge'],
  'Jaipur': ['Vaishali Nagar', 'Malviya Nagar', 'C-Scheme', 'Mansarovar', 'Raja Park'],
  'Chandigarh': ['Sector 10', 'Sector 35', 'Sector 17', 'Sector 22', 'Sector 8'],
  'Ahmedabad': ['SG Highway', 'Satellite', 'Bodakdev', 'C G Road', 'Prahlad Nagar'],
  'Lucknow': ['Gomti Nagar Extension', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Janki Puram']
};

const imagesPool = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f93?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600607687644-c7a34b0f7a1d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
];

const amenitiesList = [
  'AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Power Backup', 'Lift', 
  'Security', 'Park', 'Gym', 'Swimming Pool', 'Clubhouse', 'Water Purifier', 
  'WiFi', 'CCTV', 'Intercom', 'Fire Safety', 'Gas Pipeline', 'Visitor Parking'
];

const ownerNames = ['Vikram Sharma', 'Priya Mehta', 'Arjun Kapoor', 'Deepak Verma', 'Neha Gupta', 'Rajesh Khanna', 'Amitabh Joshi', 'Sanjay Patil', 'Sunil Reddy', 'Kiran Kumar', 'Venkata Rao', 'Anita Deshmukh', 'Sachin Pawar', 'Priyanka Shah', 'Rajeshwari Iyer', 'Lakshmi Narayanan', 'Arindam Banerjee', 'Sonia Dasgupta', 'Dinesh Patel', 'Ravi Singh', 'Harpreet Kaur', 'Mohan Lal', 'Suresh Yadav'];

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomSlice = (arr, num) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

const generateAllProperties = () => {
  const list = [];
  let index = 1;
  
  for (const cityInfo of citiesInfo) {
    const cityLocalities = localities[cityInfo.name] || ['Main Town'];
    
    for (let i = 0; i < 8; i++) {
      const type = propertyTypes[i % propertyTypes.length];
      const locality = cityLocalities[i % cityLocalities.length];
      const isCommercial = ['office', 'shop', 'warehouse'].includes(type);
      
      const bedrooms = isCommercial ? 0 : randomRange(1, 4);
      const bathrooms = isCommercial ? randomRange(1, 2) : randomRange(1, 3);
      const area = isCommercial ? randomRange(500, 5000) : randomRange(400, 2800);
      
      let rent = randomRange(8000, 35000);
      if (type === 'villa' || type === 'penthouse') rent = randomRange(45000, 150000);
      if (type === 'warehouse' || type === 'office') rent = randomRange(50000, 250000);
      if (type === 'pg-hostel' || type === 'studio') rent = randomRange(5000, 15000);
      
      const deposit = Math.round(rent * randomRange(2, 4));
      const maintenance = Math.round(rent * 0.1);
      
      const imageCount = randomRange(5, 8);
      const images = randomSlice(imagesPool, imageCount);
      const amenities = randomSlice(amenitiesList, randomRange(4, 9));
      
      const name = randomElement(ownerNames);
      
      list.push({
        title: `${bedrooms > 0 ? bedrooms + ' BHK' : ''} ${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')} in ${locality}, ${cityInfo.name}`,
        description: `Premium state of the art ${type.replace('-', ' ')} situated in the beautiful locality of ${locality}. This property offers an outstanding space layout, superior ventilation, and premium modern fittings. Located close to critical transit points, shopping complexes, schools, and hospitals. Highly suitable for residents looking for comfort, security, and prestige.`,
        property_type: type,
        city: cityInfo.name,
        locality: locality,
        state: cityInfo.state,
        pincode: randomElement(cityInfo.pincodes),
        monthly_rent: rent,
        security_deposit: deposit,
        maintenance: maintenance,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        area_sqft: area,
        furnishing: randomElement(['fully-furnished', 'semi-furnished', 'unfurnished']),
        parking: randomElement(['none', 'two-wheeler', 'four-wheeler', 'both']),
        pet_friendly: Math.random() > 0.4,
        amenities: amenities,
        nearby_metro: `${locality} Metro Station (${randomRange(200, 1500)}m)`,
        nearby_schools: [`${locality} International School`, 'DAV Public School'],
        nearby_hospitals: [`${locality} General Hospital`, 'Apollo Medical Center'],
        latitude: 20 + Math.random() * 8,
        longitude: 72 + Math.random() * 14,
        is_verified: Math.random() > 0.3,
        is_featured: Math.random() > 0.7,
        images: images,
        owner_name: name,
        owner_phone: `+91-98765${String(index).padStart(5, '0')}`,
        owner_email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
        address_line1: `Flat No ${randomRange(101, 909)}, Block ${randomElement(['A', 'B', 'C', 'D', 'E'])}`,
        address_line2: `${locality} Housing Society`
      });
      index++;
    }
  }
  return list;
};

async function seedProperties() {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting property seeding (112 properties total)...');
    
    // Check/Create owner user
    const userResult = await client.query("SELECT id FROM users WHERE email = 'admin@rentalmarketplace.com' LIMIT 1");
    let ownerId = userResult.rows[0]?.id;
    if (!ownerId) {
      console.log('❌ Admin user not found! Please run setup-db.js first.');
      process.exit(1);
    }
    
    // Clear properties table cleanly
    await client.query('TRUNCATE TABLE properties CASCADE');
    console.log('🗑️  Truncated properties table.');

    // Fetch categories and cities maps
    const categoriesRes = await client.query('SELECT id, slug FROM categories');
    const categoriesMap = {};
    categoriesRes.rows.forEach(r => {
      categoriesMap[r.slug] = r.id;
    });

    const citiesRes = await client.query('SELECT id, name FROM cities');
    const citiesMap = {};
    citiesRes.rows.forEach(r => {
      citiesMap[r.name] = r.id;
    });

    const props = generateAllProperties();
    
    // Build multi-row INSERT query
    const fields = [
      'owner_id', 'title', 'description', 'property_type', 'category_id', 'city_id',
      'monthly_rent', 'security_deposit', 'maintenance', 'bedrooms', 'bathrooms',
      'area_sqft', 'furnishing', 'amenities', 'parking', 'pet_friendly',
      'address_line1', 'address_line2', 'city', 'locality', 'state', 'pincode',
      'latitude', 'longitude', 'nearby_metro', 'nearby_schools', 'nearby_hospitals',
      'images', 'owner_name', 'owner_phone', 'owner_email',
      'is_verified', 'is_featured'
    ];

    let queryText = `INSERT INTO properties (${fields.join(', ')}) VALUES `;
    const queryValues = [];
    let paramIndex = 1;

    const valueRows = [];
    for (const prop of props) {
      const categoryId = categoriesMap[prop.property_type] || categoriesMap['apartment'] || null;
      const cityId = citiesMap[prop.city] || null;

      const rowValues = [
        ownerId, prop.title, prop.description, prop.property_type, categoryId, cityId,
        prop.monthly_rent, prop.security_deposit, prop.maintenance, prop.bedrooms, prop.bathrooms,
        prop.area_sqft, prop.furnishing, JSON.stringify(prop.amenities), prop.parking, prop.pet_friendly,
        prop.address_line1, prop.address_line2, prop.city, prop.locality, prop.state, prop.pincode,
        prop.latitude, prop.longitude, prop.nearby_metro, JSON.stringify(prop.nearby_schools), JSON.stringify(prop.nearby_hospitals),
        JSON.stringify(prop.images), prop.owner_name, prop.owner_phone, prop.owner_email,
        prop.is_verified, prop.is_featured
      ];

      const valuePlaceholders = [];
      rowValues.forEach(val => {
        queryValues.push(val);
        valuePlaceholders.push(`$${paramIndex++}`);
      });

      valueRows.push(`(${valuePlaceholders.join(', ')})`);
    }

    queryText += valueRows.join(', ');
    console.log(`📡 Sending batch insert of ${props.length} properties...`);
    await client.query(queryText, queryValues);

    // Update property counts in cities
    await client.query(`
      UPDATE cities c SET property_count = (
        SELECT COUNT(*) FROM properties p WHERE p.city_id = c.id AND p.is_active = true
      )
    `);
    
    console.log(`🎉 Seed complete! ${props.length} properties successfully batch inserted.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Property seeding error:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedProperties();
