const AppError = require('../utils/AppError');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    statusCode: err.statusCode,
    errorCode: err.errorCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // PostgreSQL duplicate key error
  if (err.code === '23505') {
    error = new AppError('Duplicate field value entered', 400, 'DUPLICATE_ERROR');
  }

  // PostgreSQL foreign key constraint error
  if (err.code === '23503') {
    error = new AppError('Invalid reference to related resource', 400, 'FOREIGN_KEY_ERROR');
  }

  // PostgreSQL not null violation
  if (err.code === '23502') {
    error = new AppError('Required field is missing', 400, 'NULL_VIOLATION');
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      errorCode: errorCode,
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
};

/**
 * Handle 404 Not Found
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
};
