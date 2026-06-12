const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkWishlistStatus,
} = require('../controllers/wishlistController');

// All wishlist routes require authentication
router.use(authMiddleware);

router.get('/', getWishlist);
router.post('/', addToWishlist);

// IMPORTANT: /check/:property_id must come before /:property_id
router.get('/check/:property_id', checkWishlistStatus);
router.get('/:property_id', checkWishlistStatus);
router.delete('/:property_id', removeFromWishlist);

module.exports = router;