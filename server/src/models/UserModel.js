const { query } = require('../config/database');

class UserModel {
  // Create a new user
  static async create(userData) {
    const { name, email, password, role = 'user', phone, profile_image } = userData;

    const sql = `
      INSERT INTO users (name, email, password, role, phone, profile_image)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, role, phone, profile_image, is_active, created_at
    `;

    const values = [name, email, password, role, phone || null, profile_image || null];
    const result = await query(sql, values);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const sql = `
      SELECT id, name, email, role, phone, profile_image, is_active, 
             is_email_verified, last_login, created_at, updated_at
      FROM users 
      WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Find user by email (includes password for authentication)
  static async findByEmail(email) {
    const sql = `
      SELECT id, name, email, password, role, phone, profile_image, 
             is_active, is_email_verified, last_login, created_at
      FROM users 
      WHERE email = $1
    `;
    const result = await query(sql, [email]);
    return result.rows[0];
  }

  // Update user
  static async update(id, updates) {
    const allowedFields = ['name', 'phone', 'profile_image', 'is_active'];
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
      UPDATE users 
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCounter}
      RETURNING id, name, email, role, phone, profile_image, is_active, created_at
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Update password
  static async updatePassword(id, hashedPassword) {
    const sql = `
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, email, role
    `;
    const result = await query(sql, [hashedPassword, id]);
    return result.rows[0];
  }

  // Update last login
  static async updateLastLogin(id) {
    const sql = `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    await query(sql, [id]);
  }

  // Get all users (for admin)
  static async findAll(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT id, name, email, role, phone, profile_image, is_active, 
             is_email_verified, last_login, created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await query(sql, [limit, offset]);

    const countSql = 'SELECT COUNT(*) FROM users';
    const countResult = await query(countSql);

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

  // Delete user (soft delete by deactivating)
  static async delete(id) {
    const sql = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, email
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Hard delete user (use with caution)
  static async hardDelete(id) {
    const sql = 'DELETE FROM users WHERE id = $1 RETURNING id, name, email';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Search users
  static async search(searchTerm, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const searchPattern = `%${searchTerm}%`;

    const sql = `
      SELECT id, name, email, role, phone, profile_image, is_active, created_at
      FROM users 
      WHERE is_active = true 
        AND (name ILIKE $1 OR email ILIKE $1)
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [searchPattern, limit, offset]);

    const countSql = `
      SELECT COUNT(*) 
      FROM users 
      WHERE is_active = true 
        AND (name ILIKE $1 OR email ILIKE $1)
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

  // Get user statistics (for admin dashboard)
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as users_with_login
      FROM users
    `;
    const result = await query(sql);
    return result.rows[0];
  }

  // Check if email exists
  static async emailExists(email, excludeId = null) {
    const sql = `
      SELECT id FROM users 
      WHERE email = $1 AND id != COALESCE($2, 0)
    `;
    const result = await query(sql, [email, excludeId]);
    return result.rows.length > 0;
  }
}

module.exports = UserModel;