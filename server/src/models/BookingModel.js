const { query } = require('../config/database');

class BookingModel {
  // Create a new booking
  static async create(bookingData) {
    const {
      property_id,
      guest_id,
      check_in_date,
      check_out_date,
      subtotal,
      cleaning_fee_charged,
      service_fee,
      total_amount,
      guest_count,
      special_requests,
      payment_intent_id,
    } = bookingData;

    const sql = `
      INSERT INTO bookings (
        property_id, guest_id, check_in_date, check_out_date,
        subtotal, cleaning_fee_charged, service_fee, total_amount,
        guest_count, special_requests, payment_intent_id, status, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      property_id, guest_id, check_in_date, check_out_date,
      subtotal, cleaning_fee_charged, service_fee, total_amount,
      guest_count, special_requests || null, payment_intent_id || null,
      'pending', 'unpaid',
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Find booking by ID
  static async findById(id) {
    const sql = `
      SELECT b.*, p.title as property_title, p.images as property_images,
             p.address_line1, p.city, p.state
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get all bookings for a guest
  static async findByGuestId(guestId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT b.*, p.title as property_title, p.images as property_images,
             p.address_line1, p.city, p.state
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.guest_id = $1
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await query(sql, [guestId, limit, offset]);
    
    const countSql = 'SELECT COUNT(*) FROM bookings WHERE guest_id = $1';
    const countResult = await query(countSql, [guestId]);
    
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

  // Get all bookings for a property (for landlord)
  static async findByPropertyId(propertyId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT b.*, p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.property_id = $1
      ORDER BY b.check_in_date DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await query(sql, [propertyId, limit, offset]);
    
    const countSql = 'SELECT COUNT(*) FROM bookings WHERE property_id = $1';
    const countResult = await query(countSql, [propertyId]);
    
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

  // Get all bookings (for Admin)
  static async findAll(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT b.*, p.title as property_title, p.images as property_images,
             p.address_line1, p.city, p.state
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      ORDER BY b.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await query(sql, [limit, offset]);
    
    const countSql = 'SELECT COUNT(*) FROM bookings';
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

  // Check if property is available for given dates
  static async checkAvailability(propertyId, checkInDate, checkOutDate) {
    const sql = `
      SELECT COUNT(*) as overlapping_bookings
      FROM bookings
      WHERE property_id = $1
        AND status IN ('pending', 'confirmed')
        AND daterange(check_in_date, check_out_date, '[)') && daterange($2, $3, '[)')
    `;
    
    const result = await query(sql, [propertyId, checkInDate, checkOutDate]);
    const overlapping = parseInt(result.rows[0].overlapping_bookings);
    
    return overlapping === 0;
  }

  // Update booking status
  static async updateStatus(id, status, cancellationReason = null) {
    const updates = { status };
    if (status === 'cancelled') {
      updates.cancelled_at = new Date();
      if (cancellationReason) {
        updates.cancellation_reason = cancellationReason;
      }
    }
    
    const setClauses = [];
    const values = [];
    let paramCounter = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = $${paramCounter++}`);
      values.push(value);
    }
    
    values.push(id);
    const sql = `
      UPDATE bookings 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;
    
    const result = await query(sql, values);
    return result.rows[0];
  }

  // Update payment status
  static async updatePaymentStatus(id, paymentStatus, paymentIntentId = null) {
    const updates = { payment_status: paymentStatus };
    if (paymentIntentId) {
      updates.payment_intent_id = paymentIntentId;
    }
    
    const sql = `
      UPDATE bookings 
      SET payment_status = $1, payment_intent_id = COALESCE($2, payment_intent_id)
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await query(sql, [paymentStatus, paymentIntentId, id]);
    return result.rows[0];
  }

  // Cancel booking
  static async cancel(id, reason = null) {
    return await this.updateStatus(id, 'cancelled', reason);
  }

  // Confirm booking (after payment)
  static async confirm(id) {
    const booking = await this.updateStatus(id, 'confirmed');
    if (booking) {
      await this.updatePaymentStatus(id, 'paid');
    }
    return booking;
  }

  // Get upcoming bookings for a property (to prevent double booking)
  static async getUpcomingBookings(propertyId) {
    const sql = `
      SELECT check_in_date, check_out_date
      FROM bookings
      WHERE property_id = $1
        AND status IN ('pending', 'confirmed')
        AND check_out_date > CURRENT_DATE
      ORDER BY check_in_date ASC
    `;
    
    const result = await query(sql, [propertyId]);
    return result.rows;
  }
}

module.exports = BookingModel;