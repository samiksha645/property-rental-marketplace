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

// Public routes
router.get('/', getAllProperties);
router.get('/search', searchProperties);
router.get('/featured', getFeaturedProperties);
router.get('/:id', getPropertyById);

// Protected routes (require authentication)
router.post('/', authMiddleware, createProperty);
router.put('/:id', authMiddleware, updateProperty);
router.delete('/:id', authMiddleware, deleteProperty);

module.exports = router;