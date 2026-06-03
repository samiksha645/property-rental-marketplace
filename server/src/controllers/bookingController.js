const BookingModel = require('../models/BookingModel');
const PropertyModel = require('../models/PropertyModel');

// Calculate booking price
const calculatePrice = (property, checkInDate, checkOutDate, guestCount) => {
  const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
  const subtotal = property.base_price_per_night * nights;
  const cleaning_fee_charged = property.cleaning_fee || 0;
  const service_fee = subtotal * 0.10; // 10% service fee
  const total_amount = subtotal + cleaning_fee_charged + service_fee;
  
  return {
    nights,
    subtotal,
    cleaning_fee_charged,
    service_fee,
    total_amount,
  };
};

// Create new booking
const createBooking = async (req, res, next) => {
  try {
    const {
      property_id,
      check_in_date,
      check_out_date,
      guest_count,
      special_requests,
    } = req.body;

    // Get authenticated guest ID
    const guest_id = req.user?.id;
    if (!guest_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Get property details
    const property = await PropertyModel.findById(property_id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past',
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    // Check availability
    const isAvailable = await BookingModel.checkAvailability(
      property_id,
      check_in_date,
      check_out_date
    );

    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Property is not available for selected dates',
      });
    }

    // Check guest count
    if (guest_count > property.max_guests) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${property.max_guests} guests allowed`,
      });
    }

    // Calculate pricing
    const pricing = calculatePrice(property, check_in_date, check_out_date, guest_count);

    // Create booking
    const bookingData = {
      property_id,
      guest_id,
      check_in_date,
      check_out_date,
      guest_count,
      special_requests,
      subtotal: pricing.subtotal,
      cleaning_fee_charged: pricing.cleaning_fee_charged,
      service_fee: pricing.service_fee,
      total_amount: pricing.total_amount,
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
          address: `${property.address_line1}, ${property.city}`,
        },
      },
      message: 'Booking created successfully. Awaiting payment.',
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
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization (guest or landlord)
    const userId = req.user?.id;
    const property = await PropertyModel.findById(booking.property_id);
    
    if (userId !== booking.guest_id && userId !== property?.landlord_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
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
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const result = await BookingModel.findByGuestId(userId, parseInt(page), parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get property bookings (for landlord)
const getPropertyBookings = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check authorization (landlord only)
    const userId = req.user?.id;
    if (property.landlord_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view bookings for this property',
      });
    }

    const result = await BookingModel.findByPropertyId(propertyId, parseInt(page), parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
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
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization (guest or property owner)
    const userId = req.user?.id;
    const property = await PropertyModel.findById(booking.property_id);
    
    if (userId !== booking.guest_id && userId !== property?.landlord_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this booking',
      });
    }

    // Check if booking can be cancelled
    const checkInDate = new Date(booking.check_in_date);
    const today = new Date();
    const daysUntilCheckIn = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilCheckIn < 1 && booking.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking less than 24 hours before check-in',
      });
    }

    const cancelledBooking = await BookingModel.cancel(id, reason);
    
    res.status(200).json({
      success: true,
      data: cancelledBooking,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Confirm booking (after payment - webhook or manual)
const confirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const booking = await BookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm booking with status: ${booking.status}`,
      });
    }

    const confirmedBooking = await BookingModel.confirm(id);
    
    res.status(200).json({
      success: true,
      data: confirmedBooking,
      message: 'Booking confirmed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Check availability for a property
const checkAvailability = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { check_in_date, check_out_date } = req.query;
    
    if (!check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required',
      });
    }

    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    const isAvailable = await BookingModel.checkAvailability(
      propertyId,
      check_in_date,
      check_out_date
    );

    // Calculate price if available
    let pricing = null;
    if (isAvailable) {
      pricing = calculatePrice(property, check_in_date, check_out_date, 1);
    }

    res.status(200).json({
      success: true,
      data: {
        available: isAvailable,
        pricing: pricing,
        property: {
          id: property.id,
          title: property.title,
          base_price_per_night: property.base_price_per_night,
          cleaning_fee: property.cleaning_fee,
          max_guests: property.max_guests,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings (for Admin)
const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const result = await BookingModel.findAll(parseInt(page), parseInt(limit));
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
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