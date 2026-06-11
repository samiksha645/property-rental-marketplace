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
router.get('/:property_id', checkWishlistStatus);
router.delete('/:property_id', removeFromWishlist);

module.exports = router;