const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getAllProperties,
  searchProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
} = require('../controllers/propertyController');

// IMPORTANT: Static routes MUST come before /:id route
// Public routes - ordered to prevent /:id from catching /featured, /search, etc.
router.get('/', getAllProperties);
router.get('/search', searchProperties);
router.get('/featured', getFeaturedProperties);
router.get('/by-city', require('../controllers/propertyController').getPropertiesByCity);

// The /:id route MUST come last to prevent it from matching static paths
router.get('/:id', require('../middleware/auth').optionalAuthMiddleware, require('../controllers/propertyController').getPropertyById);

// Protected routes (require authentication)
router.post('/', authMiddleware, createProperty);
router.put('/:id', authMiddleware, updateProperty);
router.delete('/:id', authMiddleware, deleteProperty);

module.exports = router;