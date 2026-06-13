const { query } = require('../config/database');

class BookingModel {
  static async create(bookingData) {
    const {
      property_id, guest_id, owner_id, check_in_date, check_out_date,
      monthly_rent, security_deposit, maintenance_fee, total_amount,
      guest_count, special_requests, status, payment_status
    } = bookingData;

    const sql = `
      INSERT INTO bookings (
        property_id, guest_id, owner_id, check_in_date, check_out_date,
        monthly_rent, security_deposit, maintenance_fee, total_amount,
        guest_count, special_requests, status, payment_status
      ) 
      SELECT $1::integer, $2::integer, $3::integer, $4::date, $5::date, 
             $6::numeric, $7::numeric, $8::numeric, $9::numeric, 
             $10::integer, $11::text, $12::varchar, $13::varchar
      WHERE NOT EXISTS (
        SELECT 1 FROM bookings 
        WHERE property_id = $1 
        AND status NOT IN ('cancelled')
        AND check_in_date < $5::date AND check_out_date > $4::date
      )
      RETURNING *
    `;

    const values = [
      property_id, guest_id, owner_id || null,
      check_in_date, check_out_date,
      monthly_rent, security_deposit || 0, maintenance_fee || 0, total_amount,
      guest_count || 1, special_requests || null,
      status || 'pending', payment_status || 'unpaid'
    ];

    const result = await query(sql, values);
    if (result.rows.length === 0) {
      throw new Error('Property is no longer available for these dates');
    }
    return result.rows[0];
  }

  static async findById(id) {
    const sql = `
      SELECT b.*, p.title as property_title, p.city, p.state, p.address_line1,
        p.images as property_images, p.monthly_rent as property_rent,
        u.name as guest_name, u.email as guest_email, u.phone as guest_phone,
        ow.name as owner_name, ow.email as owner_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      LEFT JOIN users ow ON b.owner_id = ow.id
      WHERE b.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async findByGuestId(guestId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const countSql = 'SELECT COUNT(*) FROM bookings WHERE guest_id = $1';
    const countResult = await query(countSql, [guestId]);
    const total = parseInt(countResult.rows[0].count);

    const sql = `
      SELECT b.*, p.title as property_title, p.city, p.state, p.address_line1,
        p.images as property_images, p.monthly_rent as property_rent,
        p.locality, p.bedrooms, p.bathrooms, p.furnishing,
        p.owner_name, p.owner_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.guest_id = $1
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [guestId, limit, offset]);

    return {
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async findByPropertyId(propertyId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const countSql = 'SELECT COUNT(*) FROM bookings WHERE property_id = $1';
    const countResult = await query(countSql, [propertyId]);
    const total = parseInt(countResult.rows[0].count);

    const sql = `
      SELECT b.*, u.name as guest_name, u.email as guest_email, u.phone as guest_phone
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      WHERE b.property_id = $1
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [propertyId, limit, offset]);

    return {
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async findAll(page = 1, limit = 50, status = null) {
    const offset = (page - 1) * limit;
    let whereClause = '';
    const values = [];

    if (status) {
      values.push(status);
      whereClause = 'WHERE b.status = $1';
    }

    const countSql = `SELECT COUNT(*) FROM bookings b ${whereClause}`;
    const countResult = await query(countSql, values);
    const total = parseInt(countResult.rows[0].count);

    const sql = `
      SELECT b.*, p.title as property_title, p.city, p.state,
        p.images as property_images, p.monthly_rent as property_rent,
        u.name as guest_name, u.email as guest_email,
        ow.name as owner_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      LEFT JOIN users ow ON b.owner_id = ow.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(limit, offset);
    const result = await query(sql, values);

    return {
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async checkAvailability(propertyId, checkInDate, checkOutDate) {
    const sql = `
      SELECT COUNT(*) as count FROM bookings 
      WHERE property_id = $1 
      AND status NOT IN ('cancelled')
      AND check_in_date < $3 AND check_out_date > $2
    `;
    const result = await query(sql, [propertyId, checkInDate, checkOutDate]);
    return parseInt(result.rows[0].count) === 0;
  }

  static async updateStatus(id, status, cancellationReason = null) {
    let sql;
    let values;

    if (status === 'cancelled') {
      sql = `
        UPDATE bookings 
        SET status = $1, cancelled_at = CURRENT_TIMESTAMP, cancellation_reason = $2, 
            payment_status = 'refunded', updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;
      values = [status, cancellationReason, id];
    } else {
      sql = `
        UPDATE bookings 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      values = [status, id];
    }

    const result = await query(sql, values);
    return result.rows[0];
  }

  static async confirm(id) {
    const sql = `
      UPDATE bookings 
      SET status = 'confirmed', payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async getUpcomingBookings(propertyId) {
    const sql = `
      SELECT * FROM bookings 
      WHERE property_id = $1 
      AND status NOT IN ('cancelled')
      AND check_out_date >= CURRENT_DATE
      ORDER BY check_in_date ASC
    `;
    const result = await query(sql, [propertyId]);
    return result.rows;
  }

  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as avg_booking_value
      FROM bookings
    `;
    const result = await query(sql);
    return result.rows[0];
  }
}

module.exports = BookingModel;