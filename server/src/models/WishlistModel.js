const { query } = require('../config/database');

class WishlistModel {
  static async add(userId, propertyId) {
    const sql = `
      INSERT INTO wishlist (user_id, property_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, property_id) DO NOTHING
      RETURNING *
    `;
    const result = await query(sql, [userId, propertyId]);
    return result.rows[0];
  }

  static async remove(userId, propertyId) {
    const sql = `
      DELETE FROM wishlist 
      WHERE user_id = $1 AND property_id = $2
      RETURNING *
    `;
    const result = await query(sql, [userId, propertyId]);
    return result.rows[0];
  }

  static async findByUserId(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const countSql = 'SELECT COUNT(*) FROM wishlist WHERE user_id = $1';
    const countResult = await query(countSql, [userId]);
    const total = parseInt(countResult.rows[0].count);

    const sql = `
      SELECT w.*, p.id as property_id, p.title, p.description, p.property_type,
        p.monthly_rent, p.security_deposit, p.maintenance,
        p.bedrooms, p.bathrooms, p.area_sqft, p.furnishing,
        p.city, p.locality, p.state, p.images, p.is_verified, p.is_featured,
        c.name as category_name
      FROM wishlist w
      JOIN properties p ON w.property_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = $1 AND p.is_active = true
      ORDER BY w.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [userId, limit, offset]);

    return {
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async isWishlisted(userId, propertyId) {
    const sql = 'SELECT id FROM wishlist WHERE user_id = $1 AND property_id = $2';
    const result = await query(sql, [userId, propertyId]);
    return result.rows.length > 0;
  }

  static async getWishlistIds(userId) {
    const sql = 'SELECT property_id FROM wishlist WHERE user_id = $1';
    const result = await query(sql, [userId]);
    return result.rows.map(r => r.property_id);
  }
}

module.exports = WishlistModel;