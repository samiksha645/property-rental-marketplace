const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  
  console.error('💥 Error caught by Express handler:', {
    message: err.message,
    statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
