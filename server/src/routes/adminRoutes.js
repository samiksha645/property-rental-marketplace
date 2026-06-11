const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  deleteUser,
  toggleUserStatus,
  getAllProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getAllBookings,
  updateBookingStatus,
  getAllReviews,
  deleteReview,
  createCategory,
  updateCategory,
  deleteCategory,
  createCity,
  updateCity,
  deleteCity,
} = require('../controllers/adminController');

// All admin routes are protected by adminMiddleware
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Property management
router.get('/properties', getAllProperties);
router.post('/properties', createProperty);
router.put('/properties/:id', updateProperty);
router.delete('/properties/:id', deleteProperty);

// Booking management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// Reviews management
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// Categories management
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Cities management
router.post('/cities', createCity);
router.put('/cities/:id', updateCity);
router.delete('/cities/:id', deleteCity);

module.exports = router;
