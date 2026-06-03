const { query } = require('../config/database');

class PropertyModel {
  // Create a new property
  static async create(propertyData) {
    const {
      landlord_id,
      title,
      description,
      property_type,
      bedrooms,
      bathrooms,
      square_feet,
      max_guests,
      base_price_per_night,
      cleaning_fee,
      security_deposit,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      latitude,
      longitude,
      amenities,
      images,
      cancellation_policy,
    } = propertyData;

    const sql = `
      INSERT INTO properties (
        landlord_id, title, description, property_type, bedrooms, bathrooms,
        square_feet, max_guests, base_price_per_night, cleaning_fee, security_deposit,
        address_line1, address_line2, city, state, postal_code, country,
        latitude, longitude, amenities, images, cancellation_policy
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *
    `;

    const values = [
      landlord_id, title, description, property_type, bedrooms, bathrooms,
      square_feet, max_guests, base_price_per_night, cleaning_fee || 0, security_deposit || 0,
      address_line1, address_line2, city, state, postal_code, country,
      latitude, longitude, amenities || [], images || [], cancellation_policy || 'flexible',
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Find property by ID
  static async findById(id) {
    const sql = 'SELECT * FROM properties WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get all properties with filters and pagination
  static async findAll(filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramCounter = 1;

    // Apply filters
    if (filters.city) {
      conditions.push(`LOWER(city) = LOWER($${paramCounter++})`);
      values.push(filters.city);
    }
    if (filters.state) {
      conditions.push(`LOWER(state) = LOWER($${paramCounter++})`);
      values.push(filters.state);
    }
    if (filters.property_type) {
      conditions.push(`property_type = $${paramCounter++}`);
      values.push(filters.property_type);
    }
    if (filters.min_price) {
      conditions.push(`base_price_per_night >= $${paramCounter++}`);
      values.push(filters.min_price);
    }
    if (filters.max_price) {
      conditions.push(`base_price_per_night <= $${paramCounter++}`);
      values.push(filters.max_price);
    }
    if (filters.bedrooms) {
      conditions.push(`bedrooms >= $${paramCounter++}`);
      values.push(filters.bedrooms);
    }
    if (filters.max_guests) {
      conditions.push(`max_guests >= $${paramCounter++}`);
      values.push(filters.max_guests);
    }
    if (filters.is_featured !== undefined) {
      conditions.push(`is_featured = $${paramCounter++}`);
      values.push(filters.is_featured);
    }
    if (filters.is_active !== undefined) {
      conditions.push(`is_active = $${paramCounter++}`);
      values.push(filters.is_active);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    // Count query
    const countSql = `SELECT COUNT(*) FROM properties ${whereClause}`;
    const countResult = await query(countSql, values);
    const total = parseInt(countResult.rows[0].count);

    // Data query with ordering
    const orderBy = filters.sort_by === 'price' ? 'base_price_per_night' : 'created_at';
    const orderDir = filters.sort_order === 'asc' ? 'ASC' : 'DESC';
    
    const dataSql = `
      SELECT * FROM properties 
      ${whereClause}
      ORDER BY ${orderBy} ${orderDir}
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

  // Update property
  static async update(id, updates) {
    const allowedFields = [
      'title', 'description', 'property_type', 'bedrooms', 'bathrooms',
      'square_feet', 'max_guests', 'base_price_per_night', 'cleaning_fee',
      'security_deposit', 'address_line1', 'address_line2', 'city', 'state',
      'postal_code', 'country', 'latitude', 'longitude', 'amenities',
      'images', 'is_active', 'is_featured', 'cancellation_policy',
    ];

    const setClauses = [];
    const values = [];
    let paramCounter = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = $${paramCounter++}`);
        values.push(updates[field]);
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

  // Delete property (soft delete)
  static async delete(id) {
    const sql = 'UPDATE properties SET is_active = false WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Search properties by text
  static async search(searchTerm, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT * FROM properties
      WHERE is_active = true 
      AND (
        title ILIKE $1 OR 
        description ILIKE $1 OR 
        city ILIKE $1 OR 
        address_line1 ILIKE $1
      )
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const result = await query(sql, [searchPattern, limit, offset]);
    
    // Get total count
    const countSql = `
      SELECT COUNT(*) FROM properties
      WHERE is_active = true 
      AND (
        title ILIKE $1 OR description ILIKE $1 OR 
        city ILIKE $1 OR address_line1 ILIKE $1
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
}

module.exports = PropertyModel;