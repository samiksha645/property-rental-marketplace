const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
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

// Protected routes (require authentication)
router.get('/', authMiddleware, getAllBookings);
router.post('/', authMiddleware, createBooking);
router.get('/my-bookings', authMiddleware, getUserBookings);
router.get('/property/:propertyId', authMiddleware, getPropertyBookings);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id/cancel', authMiddleware, cancelBooking);
router.put('/:id/confirm', authMiddleware, confirmBooking);

module.exports = router;