const { query } = require('../config/database');

class ReviewModel {
  static async create(reviewData) {
    const { user_id, property_id, rating, comment } = reviewData;
    const sql = `
      INSERT INTO reviews (user_id, property_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, property_id) 
      DO UPDATE SET rating = $3, comment = $4, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await query(sql, [user_id, property_id, rating, comment]);
    return result.rows[0];
  }

  static async findByPropertyId(propertyId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const countSql = 'SELECT COUNT(*) FROM reviews WHERE property_id = $1';
    const countResult = await query(countSql, [propertyId]);
    const total = parseInt(countResult.rows[0].count);

    const sql = `
      SELECT r.*, u.name as user_name, u.profile_image as user_image
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.property_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [propertyId, limit, offset]);

    return {
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getAverageRating(propertyId) {
    const sql = `
      SELECT 
        ROUND(AVG(rating)::numeric, 1) as average_rating,
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews 
      WHERE property_id = $1
    `;
    const result = await query(sql, [propertyId]);
    return result.rows[0];
  }
}

module.exports = ReviewModel;