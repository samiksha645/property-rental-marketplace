const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  createBooking,
  getBookingById,
  getUserBookings,
  getPropertyBookings,
  cancelBooking,
  confirmBooking,
  checkAvailability,
  getAllBookings,
} = require('../controllers/bookingController');

// Public route for availability check
router.get('/availability/:propertyId', checkAvailability);

// Protected routes
// Note: Static routes must come BEFORE parameterized routes to prevent "my-bookings" matching as :id
router.get('/my-bookings', authMiddleware, getUserBookings);
router.post('/', authMiddleware, createBooking);
router.get('/property/:propertyId', authMiddleware, getPropertyBookings);

// Admin-only route to get all bookings
router.get('/', authMiddleware, adminMiddleware, getAllBookings);

// Parameterized routes (must be last)
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id/cancel', authMiddleware, cancelBooking);
router.put('/:id/confirm', authMiddleware, confirmBooking);

module.exports = router;
