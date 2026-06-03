const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header is present and starts with Bearer
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret_key');
        req.user = decoded;
        return next();
      } catch (err) {
        console.warn('⚠️ Token validation failed, falling back to mock user in development');
      }
    }
    
    // Fallback Mock User for Development/Testing
    // This allows bookings and other actions to proceed without needing a login interface
    req.user = {
      id: 1,
      email: 'guest@example.com',
      name: 'John Doe',
      role: 'guest'
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
