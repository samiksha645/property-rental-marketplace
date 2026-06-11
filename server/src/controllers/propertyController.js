const PropertyModel = require('../models/PropertyModel');
const BookingModel = require('../models/BookingModel');
const WishlistModel = require('../models/WishlistModel');
const ReviewModel = require('../models/ReviewModel');

// Get all properties with filters
const getAllProperties = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, city, state, locality, property_type,
      category_id, min_rent, max_rent, bedrooms, bathrooms,
      furnishing, parking, pet_friendly, is_verified, is_featured,
      sort_by, sort_order, owner_id
    } = req.query;

    const filters = {};
    if (city) filters.city = city;
    if (state) filters.state = state;
    if (locality) filters.locality = locality;
    if (property_type) filters.property_type = property_type;
    if (category_id) filters.category_id = parseInt(category_id);
    if (min_rent) filters.min_rent = parseFloat(min_rent);
    if (max_rent) filters.max_rent = parseFloat(max_rent);
    if (bedrooms) filters.bedrooms = parseInt(bedrooms);
    if (bathrooms) filters.bathrooms = parseFloat(bathrooms);
    if (furnishing) filters.furnishing = furnishing;
    if (parking) filters.parking = parking;
    if (pet_friendly) filters.pet_friendly = pet_friendly;
    if (is_verified) filters.is_verified = is_verified;
    if (is_featured) filters.is_featured = is_featured;
    if (owner_id) filters.owner_id = parseInt(owner_id);
    if (sort_by) filters.sort_by = sort_by;
    if (sort_order) filters.sort_order = sort_order;

    const result = await PropertyModel.findAll(filters, parseInt(page), parseInt(limit));

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

// Get single property by ID
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

    // Get availability
    const available = true; // Will be checked per booking
    
    // Get wishlist status if user is authenticated
    let is_wishlisted = false;
    if (req.user) {
      is_wishlisted = await WishlistModel.isWishlisted(req.user.id, id);
    }

    // Get reviews
    const reviews = await ReviewModel.findByPropertyId(id);
    const ratingData = await ReviewModel.getAverageRating(id);

    // Get wishlist count
    const { query } = require('../config/database');
    const wishlistCount = await query(
      'SELECT COUNT(*) as count FROM wishlist WHERE property_id = $1', [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...property,
        is_wishlisted,
        wishlist_count: parseInt(wishlistCount.rows[0].count),
        reviews: reviews.data,
        rating: ratingData,
        available,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create new property
const createProperty = async (req, res, next) => {
  try {
    const owner_id = req.user?.id;
    
    if (!owner_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const propertyData = { ...req.body, owner_id };
    const newProperty = await PropertyModel.create(propertyData);
    
    res.status(201).json({
      success: true,
      data: newProperty,
      message: 'Property listed successfully',
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

    const owner_id = req.user?.id;
    if (owner_id && property.owner_id !== owner_id) {
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

    const owner_id = req.user?.id;
    if (owner_id && property.owner_id !== owner_id) {
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
    const { limit = 8 } = req.query;
    const result = await PropertyModel.findAll(
      { is_featured: 'true' },
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

// Get properties by city for popular cities section
const getPropertiesByCity = async (req, res, next) => {
  try {
    const { city, limit = 4 } = req.query;
    if (!city) {
      return res.status(400).json({ success: false, message: 'City parameter required' });
    }

    const result = await PropertyModel.findAll({ city }, 1, parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: result.data,
      city,
      count: result.pagination.total,
    });
  } catch (error) {
    next(error);
  }
};

// Get all cities with property counts
const getCities = async (req, res, next) => {
  try {
    const { query } = require('../config/database');
    const result = await query(`
      SELECT c.*, 
        COUNT(p.id) as total_properties
      FROM cities c
      LEFT JOIN properties p ON p.city_id = c.id AND p.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.is_popular DESC, total_properties DESC
    `);
    
    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// Get all categories
const getCategories = async (req, res, next) => {
  try {
    const { query } = require('../config/database');
    const result = await query(`
      SELECT cat.*, 
        COUNT(p.id) as total_properties
      FROM categories cat
      LEFT JOIN properties p ON p.category_id = cat.id AND p.is_active = true
      WHERE cat.is_active = true
      GROUP BY cat.id
      ORDER BY cat.sort_order ASC
    `);
    
    res.status(200).json({
      success: true,
      data: result.rows,
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
  getPropertiesByCity,
  getCities,
  getCategories,
};