const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  deleteUser,
  getAllProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getAllBookings,
  updateBookingStatus,
} = require('../controllers/adminController');

// All admin routes are protected by adminMiddleware
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);

// Property management
router.get('/properties', getAllProperties);
router.post('/properties', createProperty);
router.put('/properties/:id', updateProperty);
router.delete('/properties/:id', deleteProperty);

// Booking management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

module.exports = router;