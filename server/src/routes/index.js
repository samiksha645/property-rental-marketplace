const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const propertyRoutes = require('./propertyRoutes');
const bookingRoutes = require('./bookingRoutes');
const wishlistRoutes = require('./wishlistRoutes');

// Auth routes
router.use('/auth', authRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Property routes
router.use('/properties', propertyRoutes);

// Booking routes
router.use('/bookings', bookingRoutes);

// Wishlist routes
router.use('/wishlist', wishlistRoutes);

// Categories & Cities endpoints (public)
const { getCities, getCategories } = require('../controllers/propertyController');
router.get('/cities', getCities);
router.get('/categories', getCategories);

module.exports = router;
