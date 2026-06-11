const WishlistModel = require('../models/WishlistModel');

// Add property to wishlist
const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { property_id } = req.body;

    if (!property_id) {
      return res.status(400).json({ success: false, message: 'Property ID is required' });
    }

    await WishlistModel.add(userId, property_id);

    res.status(200).json({
      success: true,
      message: 'Added to wishlist',
      data: { property_id, is_wishlisted: true },
    });
  } catch (error) {
    next(error);
  }
};

// Remove property from wishlist
const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { property_id } = req.params;

    await WishlistModel.remove(userId, property_id);

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist',
      data: { property_id: parseInt(property_id), is_wishlisted: false },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's wishlist
const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await WishlistModel.findByUserId(userId, parseInt(page), parseInt(limit));

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Check if property is wishlisted
const checkWishlistStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { property_id } = req.params;

    const isWishlisted = await WishlistModel.isWishlisted(userId, property_id);

    res.status(200).json({
      success: true,
      data: { property_id: parseInt(property_id), is_wishlisted: isWishlisted },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkWishlistStatus,
};