const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const propertyRoutes = require('./propertyRoutes');
const bookingRoutes = require('./bookingRoutes');

// Auth routes
router.use('/auth', authRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Property routes
router.use('/properties', propertyRoutes);

// Booking routes
router.use('/bookings', bookingRoutes);

module.exports = router;
