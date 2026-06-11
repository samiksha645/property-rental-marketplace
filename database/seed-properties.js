require('dotenv').config({ path: require('path').join(__dirname, '..', 'server', '.env') });
const { pool } = require('../server/src/config/database');

const indianProperties = [
  // Delhi Properties
  {
    title: '3 BHK Luxury Apartment in Dwarka Sec 21',
    description: 'Spacious 3 BHK apartment in the heart of Dwarka Sector 21. Close to Dwarka Sector 21 Metro Station. Well-ventilated rooms with modern fittings. The society has 24/7 security, power backup, and landscaped gardens. Walking distance to schools and hospitals.',
    property_type: 'apartment',
    city: 'Delhi',
    locality: 'Dwarka Sector 21',
    state: 'Delhi',
    pincode: '110075',
    monthly_rent: 28000,
    security_deposit: 84000,
    maintenance: 3500,
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 1350,
    furnishing: 'fully-furnished',
    parking: 'four-wheeler',
    pet_friendly: false,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Power Backup', 'Lift', 'Security', 'Park', 'Gym', 'Swimming Pool']),
    nearby_metro: 'Dwarka Sector 21 Metro Station (500m)',
    nearby_schools: JSON.stringify(['Delhi Public School Dwarka', 'St. Mary\'s School']),
    nearby_hospitals: JSON.stringify(['Fortis Hospital Dwarka', 'Manipal Hospital']) ,
    latitude: 28.5921,
    longitude: 77.0458,
    is_verified: true,
    is_featured: true,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Vikram Sharma',
    owner_phone: '+91-9876543210',
    owner_email: 'vikram.sharma@email.com',
    address_line1: 'A-45, Sector 21',
    address_line2: 'Dwarka'
  },
  {
    title: '2 BHK Independent House in Lajpat Nagar',
    description: 'Beautiful independent house in the heart of South Delhi. Recently renovated with modern interiors. Available for immediate move-in. Close to Lajpat Nagar Market and Metro Station.',
    property_type: 'independent-house',
    city: 'Delhi',
    locality: 'Lajpat Nagar',
    state: 'Delhi',
    pincode: '110024',
    monthly_rent: 35000,
    security_deposit: 105000,
    maintenance: 0,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1100,
    furnishing: 'fully-furnished',
    parking: 'both',
    pet_friendly: true,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Garden', 'Parking', 'Water Purifier']),
    nearby_metro: 'Lajpat Nagar Metro Station (800m)',
    nearby_schools: JSON.stringify(['St. John\'s School', 'Mata Jai Kaur Public School']),
    nearby_hospitals: JSON.stringify(['Max Hospital Saket', 'Fortis Escorts']) ,
    latitude: 28.5718,
    longitude: 77.2426,
    is_verified: true,
    is_featured: true,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Priya Mehta',
    owner_phone: '+91-9876543211',
    owner_email: 'priya.mehta@email.com',
    address_line1: 'B-12, Lajpat Nagar II',
    address_line2: 'Near Amar Colony'
  },
  // Noida Properties
  {
    title: '4 BHK Penthouse in Sector 62 Noida',
    description: 'Stunning 4 BHK penthouse with panoramic city views. Top floor with private terrace. Premium fixtures and fittings throughout. Gated community with world-class amenities. Located close to IT hubs and corporate offices.',
    property_type: 'penthouse',
    city: 'Noida',
    locality: 'Sector 62',
    state: 'Uttar Pradesh',
    pincode: '201301',
    monthly_rent: 55000,
    security_deposit: 165000,
    maintenance: 5000,
    bedrooms: 4,
    bathrooms: 3,
    area_sqft: 2200,
    furnishing: 'fully-furnished',
    parking: 'four-wheeler',
    pet_friendly: true,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Power Backup', 'Lift', 'Security', 'Terrace Garden', 'Jacuzzi', 'Smart Home']),
    nearby_metro: 'Noida Sector 62 Metro Station (1km)',
    nearby_schools: JSON.stringify(['Amity International School', 'DPS Noida']),
    nearby_hospitals: JSON.stringify(['Fortis Hospital Noida', 'Yatharth Hospital']) ,
    latitude: 28.6198,
    longitude: 77.3646,
    is_verified: true,
    is_featured: true,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687644-c7a34b0f7a1d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Arjun Kapoor',
    owner_phone: '+91-9876543212',
    owner_email: 'arjun.kapoor@email.com',
    address_line1: 'Tower A, The Residency',
    address_line2: 'Sector 62'
  },
  {
    title: '1 BHK Studio Apartment in Sector 18 Noida',
    description: 'Compact and stylish studio apartment perfect for working professionals. Prime location near Noida Sector 18 market and metro. All basic amenities included. Ideal for singles or couples.',
    property_type: 'studio',
    city: 'Noida',
    locality: 'Sector 18',
    state: 'Uttar Pradesh',
    pincode: '201301',
    monthly_rent: 15000,
    security_deposit: 45000,
    maintenance: 2000,
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 450,
    furnishing: 'fully-furnished',
    parking: 'two-wheeler',
    pet_friendly: false,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Power Backup', 'Lift', 'Security']),
    nearby_metro: 'Noida Sector 18 Metro Station (200m)',
    nearby_schools: JSON.stringify(['Ryan International School']),
    nearby_hospitals: JSON.stringify(['Kailash Hospital']) ,
    latitude: 28.5714,
    longitude: 77.3247,
    is_verified: true,
    is_featured: false,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Deepak Verma',
    owner_phone: '+91-9876543213',
    owner_email: 'deepak.verma@email.com',
    address_line1: 'City Center Apartments',
    address_line2: 'Sector 18'
  },
  // Gurugram Properties  
  {
    title: '3 BHK Luxury Apartment in DLF Phase 2',
    description: 'Premium 3 BHK apartment in DLF Phase 2, Gurugram. Well-maintained with modern interiors. Large balcony with garden views. Access to clubhouse, pool, and gym. Close to Cyber City and Golf Course Road.',
    property_type: 'apartment',
    city: 'Gurugram',
    locality: 'DLF Phase 2',
    state: 'Haryana',
    pincode: '122002',
    monthly_rent: 45000,
    security_deposit: 135000,
    maintenance: 5000,
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 1800,
    furnishing: 'fully-furnished',
    parking: 'four-wheeler',
    pet_friendly: true,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Power Backup', 'Lift', 'Security', 'Clubhouse', 'Swimming Pool', 'Gym', 'Garden']),
    nearby_metro: 'Sikanderpur Metro Station (2km)',
    nearby_schools: JSON.stringify(['The Shri Ram School', 'DPS Gurugram']),
    nearby_hospitals: JSON.stringify(['Medanta Medicity', 'Artemis Hospital']) ,
    latitude: 28.4769,
    longitude: 77.0841,
    is_verified: true,
    is_featured: true,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Neha Gupta',
    owner_phone: '+91-9876543214',
    owner_email: 'neha.gupta@email.com',
    address_line1: 'Magnolia Towers',
    address_line2: 'DLF Phase 2'
  },
  {
    title: '2 BHK Independent Floor in Sushant Lok',
    description: 'Modern independent floor with private entrance. Recently renovated with premium finishes. Quiet and green neighborhood. Walking distance to Huda City Centre Metro.',
    property_type: 'apartment',
    city: 'Gurugram',
    locality: 'Sushant Lok',
    state: 'Haryana',
    pincode: '122009',
    monthly_rent: 22000,
    security_deposit: 66000,
    maintenance: 2000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 950,
    furnishing: 'semi-furnished',
    parking: 'four-wheeler',
    pet_friendly: true,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Parking', 'Garden']),
    nearby_metro: 'Huda City Centre Metro Station (1.5km)',
    nearby_schools: JSON.stringify(['Sanskriti School', 'GD Goenka']),
    nearby_hospitals: JSON.stringify(['Max Hospital', 'Columbia Asia']) ,
    latitude: 28.4203,
    longitude: 77.0847,
    is_verified: true,
    is_featured: false,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Rajesh Khanna',
    owner_phone: '+91-9876543215',
    owner_email: 'rajesh.khanna@email.com',
    address_line1: 'C-23, Sushant Lok',
    address_line2: 'Phase 1'
  },
  // Mumbai Properties
  {
    title: '2 BHK Sea Facing Apartment in Bandra West',
    description: 'Stunning sea-facing 2 BHK apartment in the heart of Bandra West. Breathtaking views of the Arabian Sea. High-end interiors with imported marble flooring. Walking distance to Bandra Fort and Carter Road.',
    property_type: 'apartment',
    city: 'Mumbai',
    locality: 'Bandra West',
    state: 'Maharashtra',
    pincode: '400050',
    monthly_rent: 85000,
    security_deposit: 255000,
    maintenance: 8000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1200,
    furnishing: 'fully-furnished',
    parking: 'four-wheeler',
    pet_friendly: false,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Sea View', 'Power Backup', 'Security', 'Gym', 'Swimming Pool']),
    nearby_metro: 'Bandra Metro Station (1km)',
    nearby_schools: JSON.stringify(['Cathedral School', 'St. Stanislaus School']),
    nearby_hospitals: JSON.stringify(['Lilavati Hospital', 'Bandra Holy Family Hospital']) ,
    latitude: 19.0596,
    longitude: 72.8295,
    is_verified: true,
    is_featured: true,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Amitabh Joshi',
    owner_phone: '+91-9876543216',
    owner_email: 'amitabh.joshi@email.com',
    address_line1: 'Sea Breeze Apartments',
    address_line2: 'Bandra West'
  },
  {
    title: '1 BHK Affordable Flat in Andheri East',
    description: 'Clean and affordable 1 BHK flat near Andheri East. Walking distance to Andheri Metro Station. Close to SEEPZ and MIDC industrial areas. Ideal for IT professionals.',
    property_type: 'apartment',
    city: 'Mumbai',
    locality: 'Andheri East',
    state: 'Maharashtra',
    pincode: '400093',
    monthly_rent: 18000,
    security_deposit: 54000,
    maintenance: 1500,
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 350,
    furnishing: 'semi-furnished',
    parking: 'two-wheeler',
    pet_friendly: false,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Security', 'Lift']),
    nearby_metro: 'Andheri Metro Station (500m)',
    nearby_schools: JSON.stringify(['St. Mary\'s Convent', 'Silver Drops School']),
    nearby_hospitals: JSON.stringify(['Nanavati Hospital', 'Cooper Hospital']) ,
    latitude: 19.1136,
    longitude: 72.8697,
    is_verified: true,
    is_featured: false,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Sanjay Patil',
    owner_phone: '+91-9876543217',
    owner_email: 'sanjay.patil@email.com',
    address_line1: 'Marol Apartments',
    address_line2: 'Andheri East'
  },
  // Bangalore Properties
  {
    title: '3 BHK Villa in Whitefield',
    description: 'Beautiful villa with private garden in the heart of Whitefield, Bangalore. Gated community with 24/7 security. Close to IT parks, schools, and hospitals. Modern amenities with a serene environment.',
    property_type: 'villa',
    city: 'Bangalore',
    locality: 'Whitefield',
    state: 'Karnataka',
    pincode: '560066',
    monthly_rent: 65000,
    security_deposit: 195000,
    maintenance: 5000,
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 2400,
    furnishing: 'fully-furnished',
    parking: 'both',
    pet_friendly: true,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Garden', 'Power Backup', 'Security', 'Parking', 'Rain Water Harvesting']),
    nearby_metro: 'Whitefield Metro Station (2km)',
    nearby_schools: JSON.stringify(['Inventure Academy', 'Greenwood High']),
    nearby_hospitals: JSON.stringify(['Manipal Hospital Whitefield', 'Vydehi Hospital']) ,
    latitude: 12.9698,
    longitude: 77.7500,
    is_verified: true,
    is_featured: true,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Sunil Reddy',
    owner_phone: '+91-9876543218',
    owner_email: 'sunil.reddy@email.com',
    address_line1: 'Serene Villas, Hoodi',
    address_line2: 'Whitefield'
  },
  {
    title: '2 BHK Apartment in Electronic City Phase 1',
    description: 'Well-ventilated 2 BHK apartment ideal for IT professionals. Located very close to Electronic City campus. Clubhouse, pool, gym, and park within the society.',
    property_type: 'apartment',
    city: 'Bangalore',
    locality: 'Electronic City Phase 1',
    state: 'Karnataka',
    pincode: '560100',
    monthly_rent: 22000,
    security_deposit: 66000,
    maintenance: 2800,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 950,
    furnishing: 'semi-furnished',
    parking: 'four-wheeler',
    pet_friendly: true,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Power Backup', 'Lift', 'Security', 'Gym', 'Pool', 'Park']),
    nearby_metro: 'Electronic City Metro (1km)',
    nearby_schools: JSON.stringify(['EuroSchool', 'Sri Chaitanya']),
    nearby_hospitals: JSON.stringify(['Apollo Clinic', 'Narayana Health City']) ,
    latitude: 12.8456,
    longitude: 77.6603,
    is_verified: true,
    is_featured: true,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Kiran Kumar',
    owner_phone: '+91-9876543219',
    owner_email: 'kiran.kumar@email.com',
    address_line1: 'Greenwood Apartments',
    address_line2: 'Electronic City Phase 1'
  },
  // Hyderabad Properties
  {
    title: '3 BHK Luxury Apartment in Gachibowli',
    description: 'Premium 3 BHK in the most sought-after area of Hyderabad. Walking distance to HITEX and major tech parks. Clubhouse, pool, tennis court and gym available. Perfect for senior IT professionals and families.',
    property_type: 'apartment',
    city: 'Hyderabad',
    locality: 'Gachibowli',
    state: 'Telangana',
    pincode: '500032',
    monthly_rent: 38000,
    security_deposit: 114000,
    maintenance: 4000,
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 1550,
    furnishing: 'fully-furnished',
    parking: 'four-wheeler',
    pet_friendly: false,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Power Backup', 'Lift', 'Security', 'Clubhouse', 'Pool', 'Gym', 'Tennis Court']),
    nearby_metro: 'HITEC City Metro Station (1.5km)',
    nearby_schools: JSON.stringify(['Oakridge International', 'Chirec Public School']),
    nearby_hospitals: JSON.stringify(['Apollo Hospital', 'Continental Hospital']) ,
    latitude: 17.4344,
    longitude: 78.3516,
    is_verified: true,
    is_featured: true,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Venkata Rao',
    owner_phone: '+91-9876543220',
    owner_email: 'venkata.rao@email.com',
    address_line1: 'Lake Vista Apartments',
    address_line2: 'Gachibowli'
  },
  {
    title: '2 BHK Independent House in Banjara Hills',
    description: 'Exclusive independent house in the posh Banjara Hills area. Private garden, ample parking, and premium finishes. Very quiet and secure neighborhood. Close to GVK One Mall.',
    property_type: 'independent-house',
    city: 'Hyderabad',
    locality: 'Banjara Hills Road 12',
    state: 'Telangana',
    pincode: '500034',
    monthly_rent: 48000,
    security_deposit: 144000,
    maintenance: 0,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1400,
    furnishing: 'fully-furnished',
    parking: 'both',
    pet_friendly: true,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Garden', 'Parking', 'Water Purifier', 'UPS']),
    nearby_metro: 'Banjara Hills Metro (2km)',
    nearby_schools: JSON.stringify(['Meridian School', 'Nasr School']),
    nearby_hospitals: JSON.stringify(['KIMS Hospital', 'Care Hospital']) ,
    latitude: 17.4134,
    longitude: 78.4362,
    is_verified: true,
    is_featured: true,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Anita Deshmukh',
    owner_phone: '+91-9876543221',
    owner_email: 'anita.deshmukh@email.com',
    address_line1: '12-2-718, Banjara Hills',
    address_line2: 'Road No 12'
  },
  // Pune Properties
  {
    title: '2 BHK Apartment in Hinjewadi Phase 3',
    description: 'Modern 2 BHK near Rajiv Gandhi Infotech Park. Excellent connectivity to Magarpatta and Kharadi. Well-equipped clubhouse with swimming pool, gym and sports facilities.',
    property_type: 'apartment',
    city: 'Pune',
    locality: 'Hinjewadi Phase 3',
    state: 'Maharashtra',
    pincode: '411057',
    monthly_rent: 20000,
    security_deposit: 60000,
    maintenance: 2500,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 850,
    furnishing: 'semi-furnished',
    parking: 'four-wheeler',
    pet_friendly: true,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Power Backup', 'Lift', 'Security', 'Gym', 'Pool', 'Garden']),
    nearby_metro: 'Hinjewadi Metro (proposed)',
    nearby_schools: JSON.stringify(['Vibgyor High', 'MIT School']),
    nearby_hospitals: JSON.stringify(['Aditya Birla Hospital', 'KEM Hospital']) ,
    latitude: 18.5913,
    longitude: 73.7388,
    is_verified: true,
    is_featured: false,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Sachin Pawar',
    owner_phone: '+91-9876543222',
    owner_email: 'sachin.pawar@email.com',
    address_line1: 'Blossom Society',
    address_line2: 'Hinjewadi Phase 3'
  },
  {
    title: '1 BHK Studio in Kharadi',
    description: 'Perfect for young professionals working in EON IT Park. Compact and fully furnished studio with all modern amenities. Walking distance to EON IT Park. Monthly maintenance included.',
    property_type: 'studio',
    city: 'Pune',
    locality: 'Kharadi',
    state: 'Maharashtra',
    pincode: '411014',
    monthly_rent: 12000,
    security_deposit: 36000,
    maintenance: 1500,
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 320,
    furnishing: 'fully-furnished',
    parking: 'two-wheeler',
    pet_friendly: false,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'WiFi', 'Security']),
    nearby_metro: 'Kharadi Metro (planned)',
    nearby_schools: JSON.stringify(['Podar International']),
    nearby_hospitals: JSON.stringify(['Surya Hospital']) ,
    latitude: 18.5541,
    longitude: 73.9449,
    is_verified: true,
    is_featured: false,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Priyanka Shah',
    owner_phone: '+91-9876543223',
    owner_email: 'priyanka.shah@email.com',
    address_line1: 'EON Residency',
    address_line2: 'Kharadi'
  },
  // Chennai Properties
  {
    title: '3 BHK Apartment in OMR, Thoraipakkam',
    description: 'Spacious 3 BHK apartment on OMR, the IT corridor of Chennai. Excellent connectivity to all major tech parks. Clubhouse, pool, gym, indoor games. Sea breeze keeps the apartment cool.',
    property_type: 'apartment',
    city: 'Chennai',
    locality: 'Thoraipakkam (OMR)',
    state: 'Tamil Nadu',
    pincode: '600097',
    monthly_rent: 30000,
    security_deposit: 90000,
    maintenance: 3500,
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 1400,
    furnishing: 'semi-furnished',
    parking: 'four-wheeler',
    pet_friendly: true,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Power Backup', 'Lift', 'Security', 'Pool', 'Gym', 'Indoor Games']),
    nearby_metro: 'Thoraipakkam Metro (proposed)',
    nearby_schools: JSON.stringify(['Hiranandani Upscale School', 'DAV School']),
    nearby_hospitals: JSON.stringify(['Global Hospital', 'MIOT International']) ,
    latitude: 12.9365,
    longitude: 80.2290,
    is_verified: true,
    is_featured: true,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Rajeshwari Iyer',
    owner_phone: '+91-9876543224',
    owner_email: 'rajeshwari.iyer@email.com',
    address_line1: 'Srinivasam Apartments',
    address_line2: 'OMR Thoraipakkam'
  },
  {
    title: '2 BHK Independent House in Adyar',
    description: 'Charming independent house in the prestigious Adyar area. Tree-lined streets, close to the beach. Traditional Kerala-style house with modern amenities. Large garden area.',
    property_type: 'independent-house',
    city: 'Chennai',
    locality: 'Adyar',
    state: 'Tamil Nadu',
    pincode: '600020',
    monthly_rent: 32000,
    security_deposit: 96000,
    maintenance: 1000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1200,
    furnishing: 'fully-furnished',
    parking: 'both',
    pet_friendly: true,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Garden', 'Parking', 'Traditional Interior']),
    nearby_metro: 'Adyar Metro (2km)',
    nearby_schools: JSON.stringify(['Sishya School', 'P. S. Higher Secondary School']),
    nearby_hospitals: JSON.stringify(['Apollo Main Hospital', 'VHS Hospital']) ,
    latitude: 13.0012,
    longitude: 80.2565,
    is_verified: true,
    is_featured: false,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Lakshmi Narayanan',
    owner_phone: '+91-9876543225',
    owner_email: 'lakshmi.narayanan@email.com',
    address_line1: 'Gandhi Nagar',
    address_line2: 'Adyar'
  },
  // Kolkata Properties
  {
    title: '2 BHK Apartment in Salt Lake Sector 5',
    description: 'Well-maintained 2 BHK in Salt Lake, the IT hub of Kolkata. Close to all major tech parks, City Centre Mall, and Karunamoyee bus stand. Modern amenities with 24/7 security.',
    property_type: 'apartment',
    city: 'Kolkata',
    locality: 'Salt Lake Sector 5',
    state: 'West Bengal',
    pincode: '700091',
    monthly_rent: 18000,
    security_deposit: 54000,
    maintenance: 2000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 800,
    furnishing: 'semi-furnished',
    parking: 'four-wheeler',
    pet_friendly: true,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Power Backup', 'Lift', 'Security', 'Park']),
    nearby_metro: 'Salt Lake Sector 5 Metro (500m)',
    nearby_schools: JSON.stringify(['BDM International', 'St. Xavier\'s School']),
    nearby_hospitals: JSON.stringify(['Columbia Asia', 'AMRI Hospital']) ,
    latitude: 22.5726,
    longitude: 88.4081,
    is_verified: true,
    is_featured: false,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Arindam Banerjee',
    owner_phone: '+91-9876543226',
    owner_email: 'arindam.banerjee@email.com',
    address_line1: 'GN Block, Sector 5',
    address_line2: 'Salt Lake'
  },
  {
    title: '1 BHK Flat in Park Street Area',
    description: 'Prime location flat on historic Park Street. Walking distance to trendy restaurants, cafes, and nightlife. Renovated with modern amenities. Ideal for professionals.',
    property_type: 'apartment',
    city: 'Kolkata',
    locality: 'Park Street',
    state: 'West Bengal',
    pincode: '700016',
    monthly_rent: 15000,
    security_deposit: 45000,
    maintenance: 2000,
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 550,
    furnishing: 'fully-furnished',
    parking: 'two-wheeler',
    pet_friendly: false,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Security']),
    nearby_metro: 'Park Street Metro Station (300m)',
    nearby_schools: JSON.stringify(['St. James School', 'Modern School']),
    nearby_hospitals: JSON.stringify(['Woodlands Hospital', 'AMRI Dhakuria']) ,
    latitude: 22.5502,
    longitude: 88.3467,
    is_verified: true,
    is_featured: false,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Sonia Dasgupta',
    owner_phone: '+91-9876543227',
    owner_email: 'sonia.dasgupta@email.com',
    address_line1: 'Park Mansions',
    address_line2: 'Park Street'
  },
  // Ahmedabad Properties
  {
    title: '3 BHK Apartment in SG Highway',
    description: 'Modern 3 BHK on SG Highway with excellent connectivity. High floor with beautiful city views. Premium amenities including infinity pool and rooftop garden.',
    property_type: 'apartment',
    city: 'Ahmedabad',
    locality: 'SG Highway',
    state: 'Gujarat',
    pincode: '380054',
    monthly_rent: 25000,
    security_deposit: 75000,
    maintenance: 3000,
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 1300,
    furnishing: 'fully-furnished',
    parking: 'four-wheeler',
    pet_friendly: false,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Power Backup', 'Lift', 'Security', 'Infinity Pool', 'Rooftop Garden', 'Gym']),
    nearby_metro: 'SG Highway Metro (800m)',
    nearby_schools: JSON.stringify(['Ahmedabad International', 'DPS Ahmedabad']),
    nearby_hospitals: JSON.stringify(['CIMS Hospital', 'Sterling Hospital']) ,
    latitude: 23.0512,
    longitude: 72.5337,
    is_verified: true,
    is_featured: true,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Dinesh Patel',
    owner_phone: '+91-9876543228',
    owner_email: 'dinesh.patel@email.com',
    address_line1: 'Skyline Residency',
    address_line2: 'SG Highway'
  },
  // Jaipur Properties  
  {
    title: '2 BHK Independent House in Vaishali Nagar',
    description: 'Beautiful Rajasthani-style independent house in the heart of Jaipur. Modern interiors with traditional touches. Large terrace with city views. Close to Vaishali Nagar market.',
    property_type: 'independent-house',
    city: 'Jaipur',
    locality: 'Vaishali Nagar',
    state: 'Rajasthan',
    pincode: '302021',
    monthly_rent: 16000,
    security_deposit: 48000,
    maintenance: 1000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1000,
    furnishing: 'semi-furnished',
    parking: 'both',
    pet_friendly: true,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Terrace', 'Parking', 'Garden']),
    nearby_metro: 'Vaishali Nagar Metro (1km)',
    nearby_schools: JSON.stringify(['St. Xavier\'s School', 'Seedling Public School']),
    nearby_hospitals: JSON.stringify(['Fortis Hospital', 'Sawai Man Singh Hospital']) ,
    latitude: 26.8993,
    longitude: 75.7500,
    is_verified: true,
    is_featured: false,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Ravi Singh',
    owner_phone: '+91-9876543229',
    owner_email: 'ravi.singh@email.com',
    address_line1: 'A-102, Vaishali Nagar',
    address_line2: 'Near Gopalpura Bypass'
  },
  // Chandigarh Properties
  {
    title: '3 BHK Apartment in Sector 10 Chandigarh',
    description: 'Premium 3 BHK in the most prestigious sector of Chandigarh. Designed by Le Corbusier\'s architecture style. Large rooms, high ceilings, and beautiful gardens. Near Rock Garden and Sukhna Lake.',
    property_type: 'apartment',
    city: 'Chandigarh',
    locality: 'Sector 10',
    state: 'Chandigarh',
    pincode: '160010',
    monthly_rent: 28000,
    security_deposit: 84000,
    maintenance: 3000,
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 1600,
    furnishing: 'fully-furnished',
    parking: 'four-wheeler',
    pet_friendly: true,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Power Backup', 'Parking', 'Garden', 'Visitor Parking']),
    nearby_metro: 'Chandigarh Metro (planned)',
    nearby_schools: JSON.stringify(['St. John\'s High School', 'Sacred Heart School']),
    nearby_hospitals: JSON.stringify(['PGIMER Chandigarh', 'Max Hospital']) ,
    latitude: 30.7333,
    longitude: 76.7794,
    is_verified: true,
    is_featured: true,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Harpreet Kaur',
    owner_phone: '+91-9876543230',
    owner_email: 'harpreet.kaur@email.com',
    address_line1: '17, Sector 10',
    address_line2: 'Near Sukhna Lake'
  },
  // Lucknow Properties
  {
    title: '2 BHK Apartment in Gomti Nagar Extension',
    description: 'Well-designed 2 BHK in the upscale Gomti Nagar Extension. Modern complex with all basic amenities. Close to Sahara Mall and Wave Mall. Peaceful and green neighborhood.',
    property_type: 'apartment',
    city: 'Lucknow',
    locality: 'Gomti Nagar Extension',
    state: 'Uttar Pradesh',
    pincode: '226010',
    monthly_rent: 15000,
    security_deposit: 45000,
    maintenance: 2000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 900,
    furnishing: 'semi-furnished',
    parking: 'four-wheeler',
    pet_friendly: false,
    amenities: JSON.stringify(['AC', 'Geyser', 'Modular Kitchen', 'Wardrobes', 'Power Backup', 'Lift', 'Security', 'Park']),
    nearby_metro: 'Gomti Nagar Metro Station (2km)',
    nearby_schools: JSON.stringify(['City Montessori School', 'St. Francis College']),
    nearby_hospitals: JSON.stringify(['Medanta Hospital', 'Apollo Hospital']) ,
    latitude: 26.8677,
    longitude: 81.0037,
    is_verified: true,
    is_featured: false,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Mohan Lal',
    owner_phone: '+91-9876543231',
    owner_email: 'mohan.lal@email.com',
    address_line1: 'Shalimar Gardens',
    address_line2: 'Gomti Nagar Extension'
  },
  // Greater Noida Properties
  {
    title: '3 BHK Apartment in Greater Noida West',
    description: 'Affordable 3 BHK in Greater Noida West, near the upcoming Jewar International Airport. Modern gated society with parks, pool, and clubhouse. Excellent for families seeking spacious living.',
    property_type: 'apartment',
    city: 'Greater Noida',
    locality: 'Greater Noida West',
    state: 'Uttar Pradesh',
    pincode: '201308',
    monthly_rent: 14000,
    security_deposit: 42000,
    maintenance: 2000,
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 1550,
    furnishing: 'semi-furnished',
    parking: 'four-wheeler',
    pet_friendly: true,
    amenities: JSON.stringify(['Geyser', 'Modular Kitchen', 'Wardrobes', 'Power Backup', 'Lift', 'Security', 'Pool', 'Park', 'Clubhouse']),
    nearby_metro: 'Greater Noida Metro (3km)',
    nearby_schools: JSON.stringify(['Ryan International', 'K.R. Mangalam']),
    nearby_hospitals: JSON.stringify(['Yatharth Hospital', 'Sharda Hospital']) ,
    latitude: 28.4960,
    longitude: 77.5490,
    is_verified: true,
    is_featured: false,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
    ]),
    owner_name: 'Suresh Yadav',
    owner_phone: '+91-9876543232',
    owner_email: 'suresh.yadav@email.com',
    address_line1: 'Panchsheel Greens',
    address_line2: 'Greater Noida West'
  }
];

async function seedProperties() {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting property seed...\n');

    // Get the first admin/owner user
    const userResult = await client.query('SELECT id FROM users WHERE role IN ($1, $2) LIMIT 1', ['admin', 'user']);
    let ownerId;
    
    if (userResult.rows.length === 0) {
      console.log('❌ No users found. Creating default owner...');
      const bcrypt = require('bcryptjs');
      const hashedPwd = await bcrypt.hash('password123', 12);
      const newUser = await client.query(
        `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Default Owner', 'owner@rental.in', hashedPwd, 'user']
      );
      ownerId = newUser.rows[0].id;
      console.log(`✅ Created default owner user with id: ${ownerId}`);
    } else {
      ownerId = userResult.rows[0].id;
      console.log(`✅ Found user with id: ${ownerId}`);
    }

    // Insert properties
    let inserted = 0;
    for (const property of indianProperties) {
      const existing = await client.query(
        'SELECT id FROM properties WHERE title = $1 AND city = $2',
        [property.title, property.city]
      );

      if (existing.rows.length === 0) {
        // Get or create category
        let catResult = await client.query(
          'SELECT id FROM categories WHERE slug = $1',
          [property.property_type]
        );
        let categoryId = catResult.rows[0]?.id;

        // Get city
        let cityResult = await client.query(
          'SELECT id FROM cities WHERE name = $1',
          [property.city]
        );
        let cityId = cityResult.rows[0]?.id;

        const sql = `
          INSERT INTO properties (
            owner_id, title, description, property_type, category_id, city_id,
            monthly_rent, security_deposit, maintenance, bedrooms, bathrooms,
            area_sqft, furnishing, amenities, parking, pet_friendly,
            address_line1, address_line2, city, locality, state, pincode,
            latitude, longitude, nearby_metro, nearby_schools, nearby_hospitals,
            images, owner_name, owner_phone, owner_email,
            is_verified, is_featured
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26::jsonb,$27::jsonb,$28::jsonb,$29,$30,$31,$32,$33)
          ON CONFLICT DO NOTHING
        `;

        await client.query(sql, [
          ownerId, property.title, property.description, property.property_type,
          categoryId, cityId,
          property.monthly_rent, property.security_deposit, property.maintenance,
          property.bedrooms, property.bathrooms, property.area_sqft,
          property.furnishing, property.amenities, property.parking, property.pet_friendly,
          property.address_line1, property.address_line2, property.city,
          property.locality, property.state, property.pincode,
          property.latitude, property.longitude, property.nearby_metro,
          property.nearby_schools, property.nearby_hospitals,
          property.images, property.owner_name, property.owner_phone,
          property.owner_email, property.is_verified, property.is_featured
        ]);
        inserted++;
        console.log(`✅ Inserted: ${property.title} (₹${property.monthly_rent}/mo)`);
      } else {
        console.log(`⏭️  Skipped (exists): ${property.title}`);
      }
    }

    // Update property counts in cities
    await client.query(`
      UPDATE cities c SET property_count = (
        SELECT COUNT(*) FROM properties p WHERE p.city_id = c.id AND p.is_active = true
      )
    `);

    console.log(`\n🎉 Seed complete! ${inserted} new properties inserted.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedProperties();