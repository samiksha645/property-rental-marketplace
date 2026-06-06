const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  logout,
  verifyToken,
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/update-password', authMiddleware, updatePassword);
router.post('/logout', authMiddleware, logout);
router.get('/verify', authMiddleware, verifyToken);

module.exports = router;