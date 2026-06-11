const BookingModel = require('../models/BookingModel');
const PropertyModel = require('../models/PropertyModel');

// Calculate booking price (monthly rental model)
const calculatePrice = (property, checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const months = Math.max(1, Math.ceil(days / 30));
  
  const monthlyRent = parseFloat(property.monthly_rent);
  const securityDeposit = parseFloat(property.security_deposit || 0);
  const maintenanceFee = parseFloat(property.maintenance || 0) * months;
  const totalRent = monthlyRent * months;
  const totalAmount = totalRent + securityDeposit + maintenanceFee;

  return {
    months,
    days,
    monthly_rent: monthlyRent,
    security_deposit: securityDeposit,
    maintenance_fee: maintenanceFee * months,
    total_amount: totalAmount,
    total_rent: totalRent,
  };
};

// Create new booking
const createBooking = async (req, res, next) => {
  try {
    const { property_id, check_in_date, check_out_date, guest_count, special_requests } = req.body;
    const guest_id = req.user?.id;

    if (!guest_id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const property = await PropertyModel.findById(property_id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res.status(400).json({ success: false, message: 'Check-in date cannot be in the past' });
    }
    if (checkOut <= checkIn) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    // Check availability
    const isAvailable = await BookingModel.checkAvailability(property_id, check_in_date, check_out_date);
    if (!isAvailable) {
      return res.status(409).json({ success: false, message: 'Property is not available for selected dates' });
    }

    if (guest_count && guest_count > 10) {
      return res.status(400).json({ success: false, message: 'Maximum 10 guests allowed' });
    }

    const pricing = calculatePrice(property, check_in_date, check_out_date);

    const bookingData = {
      property_id,
      guest_id,
      owner_id: property.owner_id,
      check_in_date,
      check_out_date,
      monthly_rent: pricing.monthly_rent,
      security_deposit: pricing.security_deposit,
      maintenance_fee: pricing.maintenance_fee,
      total_amount: pricing.total_amount,
      guest_count: guest_count || 1,
      special_requests,
      status: 'pending',
      payment_status: 'unpaid',
    };

    const booking = await BookingModel.create(bookingData);

    res.status(201).json({
      success: true,
      data: {
        booking,
        pricing,
        property: {
          id: property.id,
          title: property.title,
          city: property.city,
          locality: property.locality,
        },
      },
      message: 'Booking created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await BookingModel.findById(id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const userId = req.user?.id;
    if (userId !== booking.guest_id && userId !== booking.owner_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this booking' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// Get user's bookings
const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const result = await BookingModel.findByGuestId(userId, parseInt(page), parseInt(limit));
    
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

// Get property bookings (for owner)
const getPropertyBookings = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const userId = req.user?.id;
    if (property.owner_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view bookings for this property' });
    }

    const result = await BookingModel.findByPropertyId(propertyId, parseInt(page), parseInt(limit));
    
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await BookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const userId = req.user?.id;
    if (userId !== booking.guest_id && userId !== booking.owner_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking' });
    }

    const cancelledBooking = await BookingModel.updateStatus(id, 'cancelled', reason);
    
    res.status(200).json({ success: true, data: cancelledBooking, message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

// Confirm booking
const confirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await BookingModel.findById(id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot confirm booking with status: ${booking.status}` });
    }

    const confirmedBooking = await BookingModel.confirm(id);
    
    res.status(200).json({ success: true, data: confirmedBooking, message: 'Booking confirmed successfully' });
  } catch (error) {
    next(error);
  }
};

// Check availability
const checkAvailability = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { check_in_date, check_out_date } = req.query;

    if (!check_in_date || !check_out_date) {
      return res.status(400).json({ success: false, message: 'Check-in and check-out dates are required' });
    }

    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const isAvailable = await BookingModel.checkAvailability(propertyId, check_in_date, check_out_date);

    let pricing = null;
    if (isAvailable) {
      pricing = calculatePrice(property, check_in_date, check_out_date);
    }

    res.status(200).json({
      success: true,
      data: {
        available: isAvailable,
        pricing,
        property: {
          id: property.id,
          title: property.title,
          monthly_rent: property.monthly_rent,
          security_deposit: property.security_deposit,
          maintenance: property.maintenance,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings (Admin)
const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const result = await BookingModel.findAll(parseInt(page), parseInt(limit), status);
    
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getUserBookings,
  getPropertyBookings,
  cancelBooking,
  confirmBooking,
  checkAvailability,
  getAllBookings,
};