const UserModel = require('../models/UserModel');
const PropertyModel = require('../models/PropertyModel');
const BookingModel = require('../models/BookingModel');

// Get dashboard statistics
const getDashboardStats = async (req, res, next) => {
  try {
    // Get user stats
    const userStats = await UserModel.getStats();

    // Get property stats
    const propertyStats = await PropertyModel.findAll({}, 1, 1);
    
    // Get booking stats
    const bookingStats = await BookingModel.findAll(1, 1);

    // Calculate revenue (sum of all confirmed bookings)
    const revenueSql = `
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(COUNT(*), 0) as total_bookings,
        COALESCE(AVG(total_amount), 0) as avg_booking_value
      FROM bookings 
      WHERE status IN ('confirmed', 'completed')
    `;
    const { query } = require('../config/database');
    const revenueResult = await query(revenueSql);

    // Get recent bookings
    const recentBookingsSql = `
      SELECT b.*, p.title as property_title, p.images as property_images,
             u.name as guest_name, u.email as guest_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `;
    const recentBookingsResult = await query(recentBookingsSql);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers: parseInt(userStats.total_users),
          totalProperties: propertyStats.pagination.total,
          totalBookings: bookingStats.pagination.total,
          totalRevenue: parseFloat(revenueResult.rows[0].total_revenue),
          avgBookingValue: parseFloat(revenueResult.rows[0].avg_booking_value),
        },
        recentBookings: recentBookingsResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    
    let result;
    if (search) {
      result = await UserModel.search(search, parseInt(page), parseInt(limit));
    } else {
      result = await UserModel.findAll(parseInt(page), parseInt(limit));
    }

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (soft delete)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await UserModel.delete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get all properties (admin view with all details)
const getAllProperties = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const sql = `
      SELECT p.*, u.name as landlord_name, u.email as landlord_email
      FROM properties p
      LEFT JOIN users u ON p.landlord_id = u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const { query } = require('../config/database');
    const offset = (page - 1) * limit;
    const result = await query(sql, [parseInt(limit), offset]);

    const countSql = 'SELECT COUNT(*) FROM properties';
    const countResult = await query(countSql);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create property (admin)
const createProperty = async (req, res, next) => {
  try {
    const propertyData = { ...req.body };
    
    // If no landlord_id provided, use a default or require it
    if (!propertyData.landlord_id) {
      return res.status(400).json({
        success: false,
        message: 'Landlord ID is required',
      });
    }

    const newProperty = await PropertyModel.create(propertyData);

    res.status(201).json({
      success: true,
      data: newProperty,
      message: 'Property created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update property (admin)
const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const property = await PropertyModel.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    const updatedProperty = await PropertyModel.update(id, updates);

    res.status(200).json({
      success: true,
      data: updatedProperty,
      message: 'Property updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete property (admin - hard delete)
const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const property = await PropertyModel.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Hard delete for admin
    const sql = 'DELETE FROM properties WHERE id = $1 RETURNING *';
    const { query } = require('../config/database');
    await query(sql, [id]);

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings
const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    
    const offset = (page - 1) * limit;
    let sql;
    let countSql;
    const values = [];

    if (status) {
      values.push(status);
      sql = `
        SELECT b.*, p.title as property_title, p.images as property_images,
               u.name as guest_name, u.email as guest_email,
               l.name as landlord_name, l.email as landlord_email
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        JOIN users u ON b.guest_id = u.id
        LEFT JOIN users l ON p.landlord_id = l.id
        WHERE b.status = $1
        ORDER BY b.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      values.push(limit, offset);
      
      countSql = 'SELECT COUNT(*) FROM bookings WHERE status = $1';
    } else {
      sql = `
        SELECT b.*, p.title as property_title, p.images as property_images,
               u.name as guest_name, u.email as guest_email,
               l.name as landlord_name, l.email as landlord_email
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        JOIN users u ON b.guest_id = u.id
        LEFT JOIN users l ON p.landlord_id = l.id
        ORDER BY b.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      values.push(limit, offset);
      
      countSql = 'SELECT COUNT(*) FROM bookings';
    }

    const { query } = require('../config/database');
    const result = await query(sql, values);
    const countResult = await query(countSql, status ? [status] : []);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update booking status
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellation_reason } = req.body;

    const booking = await BookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    let updatedBooking;
    if (status === 'cancelled') {
      updatedBooking = await BookingModel.updateStatus(id, status, cancellation_reason);
    } else if (status === 'confirmed') {
      updatedBooking = await BookingModel.confirm(id);
    } else {
      updatedBooking = await BookingModel.updateStatus(id, status);
    }

    res.status(200).json({
      success: true,
      data: updatedBooking,
      message: `Booking ${status} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  deleteUser,
  getAllProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getAllBookings,
  updateBookingStatus,
};