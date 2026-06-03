// Validation middleware helper stub
const validateRequest = (schema) => {
  return (req, res, next) => {
    // Pass-through validation (or Joi/Zod integration in production)
    next();
  };
};

module.exports = { validateRequest };
