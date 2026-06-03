const PropertyModel = require('../models/PropertyModel');
const BookingModel = require('../models/BookingModel');

// Get all properties with filters
const getAllProperties = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      city,
      state,
      property_type,
      min_price,
      max_price,
      bedrooms,
      max_guests,
      is_featured,
      sort_by,
      sort_order,
    } = req.query;

    const filters = {
      city,
      state,
      property_type,
      min_price: min_price ? parseFloat(min_price) : null,
      max_price: max_price ? parseFloat(max_price) : null,
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      max_guests: max_guests ? parseInt(max_guests) : null,
      is_featured: is_featured === 'true' ? true : is_featured === 'false' ? false : undefined,
      is_active: true,
      sort_by,
      sort_order,
    };

    // Remove null/undefined filters
    Object.keys(filters).forEach(key => 
      filters[key] === null || filters[key] === undefined ? delete filters[key] : null
    );

    const result = await PropertyModel.findAll(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Search properties
const searchProperties = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const result = await PropertyModel.search(q, parseInt(page), parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      searchTerm: q,
    });
  } catch (error) {
    next(error);
  }
};

// Get single property by ID with availability check
const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await PropertyModel.findById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Get upcoming bookings to show blocked dates
    const upcomingBookings = await BookingModel.getUpcomingBookings(id);
    const blockedDates = upcomingBookings.map(booking => ({
      start: booking.check_in_date,
      end: booking.check_out_date,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...property,
        blocked_dates: blockedDates,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create new property
const createProperty = async (req, res, next) => {
  try {
    // In production, get landlord_id from authenticated user
    const landlord_id = req.user?.id || req.body.landlord_id;
    
    if (!landlord_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const propertyData = { ...req.body, landlord_id };
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

// Update property
const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await PropertyModel.findById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check authorization (in production, verify landlord_id matches authenticated user)
    const landlord_id = req.user?.id;
    if (landlord_id && property.landlord_id !== landlord_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this property',
      });
    }

    const updatedProperty = await PropertyModel.update(id, req.body);
    
    res.status(200).json({
      success: true,
      data: updatedProperty,
      message: 'Property updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete property (soft delete)
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

    // Check authorization
    const landlord_id = req.user?.id;
    if (landlord_id && property.landlord_id !== landlord_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this property',
      });
    }

    await PropertyModel.delete(id);
    
    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get featured properties
const getFeaturedProperties = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    const result = await PropertyModel.findAll(
      { is_featured: true, is_active: true },
      1,
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProperties,
  searchProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
};