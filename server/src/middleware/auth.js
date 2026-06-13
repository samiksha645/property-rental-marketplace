const supabase = require('../config/supabase');
const UserModel = require('../models/UserModel');
const AppError = require('../utils/AppError');

// Strict auth middleware - no fallback
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
      });
    }

    // Verify token using Supabase
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
    
    if (error || !supabaseUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    // Map Supabase user to Local Postgres integer ID
    let localUser = await UserModel.findByEmail(supabaseUser.email);
    if (!localUser) {
      // Auto-create local profile if it doesn't exist
      localUser = await UserModel.create({
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.username || 'User',
        email: supabaseUser.email,
        password: 'supabase_managed', // password managed by Supabase
        role: supabaseUser.user_metadata?.role || 'user',
      });
    }
    
    // Attach user to request
    req.user = {
      id: localUser.id, // The local integer ID!
      email: localUser.email,
      role: localUser.role,
      supabase_id: supabaseUser.id,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Optional auth middleware - sets user if token is valid, but doesn't require it
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
      
      if (!error && supabaseUser) {
        let localUser = await UserModel.findByEmail(supabaseUser.email);
        if (!localUser) {
          localUser = await UserModel.create({
            name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.username || 'User',
            email: supabaseUser.email,
            password: 'supabase_managed',
            role: supabaseUser.user_metadata?.role || 'user',
          });
        }
        req.user = {
          id: localUser.id,
          email: localUser.email,
          role: localUser.role,
          supabase_id: supabaseUser.id,
        };
      } else {
        req.user = null;
      }
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Authenticated session required.',
      });
    }
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Requires ${role} role.`,
      });
    }
    next();
  };
};

module.exports = authMiddleware;
module.exports.optionalAuthMiddleware = optionalAuthMiddleware;
module.exports.requireRole = requireRole;