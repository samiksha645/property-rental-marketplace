const authMiddleware = require('./auth');

// Admin middleware - checks if user is admin
const adminMiddleware = (req, res, next) => {
  // First, authenticate the user
  authMiddleware(req, res, (err) => {
    if (err) {
      return next(err);
    }

    // Check if user has admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    // User is authenticated and is an admin
    next();
  });
};

// Middleware to check for specific roles
const requireRole = (roles) => {
  return (req, res, next) => {
    authMiddleware(req, res, (err) => {
      if (err) {
        return next(err);
      }

      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${roles.join(', ')}`,
        });
      }

      next();
    });
  };
};

module.exports = adminMiddleware;
module.exports.requireRole = requireRole;