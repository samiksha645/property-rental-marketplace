const { query } = require('../config/database');

class PropertyModel {
  static async create(propertyData) {
    const {
      owner_id, title, description, property_type, category_id, city_id,
      monthly_rent, security_deposit, maintenance, bedrooms, bathrooms,
      area_sqft, area_sqyd, furnishing, amenities, parking, pet_friendly,
      address_line1, address_line2, city, locality, state, pincode,
      latitude, longitude, nearby_metro, nearby_schools, nearby_hospitals,
      nearby_malls, owner_name, owner_phone, owner_email, images
    } = propertyData;

    const sql = `
      INSERT INTO properties (
        owner_id, title, description, property_type, category_id, city_id,
        monthly_rent, security_deposit, maintenance, bedrooms, bathrooms,
        area_sqft, area_sqyd, furnishing, amenities, parking, pet_friendly,
        address_line1, address_line2, city, locality, state, pincode,
        latitude, longitude, nearby_metro, nearby_schools, nearby_hospitals,
        nearby_malls, owner_name, owner_phone, owner_email, images
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33)
      RETURNING *
    `;

    const values = [
      owner_id, title, description, property_type || 'apartment', category_id, city_id,
      monthly_rent, security_deposit || 0, maintenance || 0, bedrooms || 1, bathrooms || 1,
      area_sqft, area_sqyd, furnishing || 'semi-furnished',
      JSON.stringify(amenities || []), parking || 'none', pet_friendly || false,
      address_line1, address_line2, city, locality, state, pincode,
      latitude, longitude, nearby_metro,
      JSON.stringify(nearby_schools || []), JSON.stringify(nearby_hospitals || []),
      JSON.stringify(nearby_malls || []),
      owner_name, owner_phone, owner_email,
      JSON.stringify(images || [])
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  static async findById(id) {
    const sql = `
      SELECT p.*, 
        c.name as category_name, c.slug as category_slug,
        ct.name as city_name, ct.state as city_state,
        u.name as owner_user_name, u.email as owner_user_email
      FROM properties p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN cities ct ON p.city_id = ct.id
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async findAll(filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const conditions = ['p.is_active = true'];
    const values = [];
    let paramCounter = 1;

    if (filters.city) {
      conditions.push(`LOWER(p.city) = LOWER($${paramCounter++})`);
      values.push(filters.city);
    }
    if (filters.state) {
      conditions.push(`LOWER(p.state) = LOWER($${paramCounter++})`);
      values.push(filters.state);
    }
    if (filters.locality) {
      conditions.push(`LOWER(p.locality) LIKE LOWER($${paramCounter++})`);
      values.push(`%${filters.locality}%`);
    }
    if (filters.property_type) {
      conditions.push(`p.property_type = $${paramCounter++}`);
      values.push(filters.property_type);
    }
    if (filters.category_id) {
      conditions.push(`p.category_id = $${paramCounter++}`);
      values.push(parseInt(filters.category_id));
    }
    if (filters.min_rent) {
      conditions.push(`p.monthly_rent >= $${paramCounter++}`);
      values.push(parseFloat(filters.min_rent));
    }
    if (filters.max_rent) {
      conditions.push(`p.monthly_rent <= $${paramCounter++}`);
      values.push(parseFloat(filters.max_rent));
    }
    if (filters.bedrooms) {
      conditions.push(`p.bedrooms >= $${paramCounter++}`);
      values.push(parseInt(filters.bedrooms));
    }
    if (filters.bathrooms) {
      conditions.push(`p.bathrooms >= $${paramCounter++}`);
      values.push(parseFloat(filters.bathrooms));
    }
    if (filters.furnishing) {
      conditions.push(`p.furnishing = $${paramCounter++}`);
      values.push(filters.furnishing);
    }
    if (filters.parking) {
      conditions.push(`p.parking = $${paramCounter++}`);
      values.push(filters.parking);
    }
    if (filters.pet_friendly === 'true') {
      conditions.push('p.pet_friendly = true');
    }
    if (filters.is_verified === 'true') {
      conditions.push('p.is_verified = true');
    }
    if (filters.is_featured === 'true') {
      conditions.push('p.is_featured = true');
    }
    if (filters.owner_id) {
      conditions.push(`p.owner_id = $${paramCounter++}`);
      values.push(parseInt(filters.owner_id));
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    const countSql = `SELECT COUNT(*) FROM properties p ${whereClause}`;
    const countResult = await query(countSql, values);
    const total = parseInt(countResult.rows[0].count);

    let orderBy = 'p.created_at DESC';
    if (filters.sort_by === 'rent') {
      orderBy = `p.monthly_rent ${filters.sort_order === 'asc' ? 'ASC' : 'DESC'}`;
    } else if (filters.sort_by === 'bedrooms') {
      orderBy = `p.bedrooms ${filters.sort_order === 'asc' ? 'ASC' : 'DESC'}`;
    } else if (filters.sort_by === 'area') {
      orderBy = `p.area_sqft ${filters.sort_order === 'asc' ? 'ASC' : 'DESC'}`;
    }

    const dataSql = `
      SELECT p.*, 
        c.name as category_name, c.slug as category_slug,
        ct.name as city_name, ct.state as city_state
      FROM properties p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN cities ct ON p.city_id = ct.id
      ${whereClause}
      ORDER BY p.is_featured DESC, p.is_verified DESC, ${orderBy}
      LIMIT $${paramCounter++} OFFSET $${paramCounter++}
    `;

    values.push(limit, offset);
    const dataResult = await query(dataSql, values);

    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async update(id, updates) {
    const allowedFields = [
      'title', 'description', 'property_type', 'category_id', 'city_id',
      'monthly_rent', 'security_deposit', 'maintenance', 'bedrooms', 'bathrooms',
      'area_sqft', 'area_sqyd', 'furnishing', 'amenities', 'parking', 'pet_friendly',
      'address_line1', 'address_line2', 'city', 'locality', 'state', 'pincode',
      'latitude', 'longitude', 'nearby_metro', 'nearby_schools', 'nearby_hospitals',
      'nearby_malls', 'owner_name', 'owner_phone', 'owner_email', 'images',
      'is_active', 'is_featured', 'is_verified'
    ];

    const setClauses = [];
    const values = [];
    let paramCounter = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (Array.isArray(updates[field]) && (field === 'amenities' || field === 'images' || field === 'nearby_schools' || field === 'nearby_hospitals' || field === 'nearby_malls')) {
          setClauses.push(`${field} = $${paramCounter++}::jsonb`);
          values.push(JSON.stringify(updates[field]));
        } else {
          setClauses.push(`${field} = $${paramCounter++}`);
          values.push(updates[field]);
        }
      }
    }

    if (setClauses.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const sql = `
      UPDATE properties 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  static async delete(id) {
    const sql = 'UPDATE properties SET is_active = false WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async hardDelete(id) {
    const sql = 'DELETE FROM properties WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async search(searchTerm, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const searchPattern = `%${searchTerm}%`;

    const sql = `
      SELECT p.*, 
        c.name as category_name,
        ct.name as city_name
      FROM properties p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN cities ct ON p.city_id = ct.id
      WHERE p.is_active = true 
      AND (
        p.title ILIKE $1 OR 
        p.description ILIKE $1 OR 
        p.city ILIKE $1 OR 
        p.locality ILIKE $1 OR
        p.address_line1 ILIKE $1 OR
        p.state ILIKE $1
      )
      ORDER BY p.is_featured DESC, p.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [searchPattern, limit, offset]);

    const countSql = `
      SELECT COUNT(*) FROM properties p
      WHERE p.is_active = true 
      AND (
        p.title ILIKE $1 OR p.description ILIKE $1 OR 
        p.city ILIKE $1 OR p.locality ILIKE $1 OR
        p.address_line1 ILIKE $1 OR p.state ILIKE $1
      )
    `;
    const countResult = await query(countSql, [searchPattern]);

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    };
  }

  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_properties,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_properties,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_properties,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_properties,
        ROUND(AVG(monthly_rent)::numeric, 0) as avg_rent,
        COUNT(DISTINCT city) as total_cities
      FROM properties
    `;
    const result = await query(sql);
    return result.rows[0];
  }
}

module.exports = PropertyModel;