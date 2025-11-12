const AppError = require('./AppError');

/**
 * Validation Error - 400
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed', errorCode = 'VALIDATION_ERROR') {
    super(message, 400, errorCode);
  }
}

/**
 * Authentication Error - 401
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', errorCode = 'AUTH_ERROR') {
    super(message, 401, errorCode);
  }
}

/**
 * Authorization Error - 403
 */
class AuthorizationError extends AppError {
  constructor(message = 'Access denied', errorCode = 'AUTHORIZATION_ERROR') {
    super(message, 403, errorCode);
  }
}

/**
 * Not Found Error - 404
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

/**
 * Conflict Error - 409
 */
class ConflictError extends AppError {
  constructor(message = 'Resource conflict', errorCode = 'CONFLICT_ERROR') {
    super(message, 409, errorCode);
  }
}

/**
 * Database Error - 500
 */
class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', errorCode = 'DATABASE_ERROR') {
    super(message, 500, errorCode, true);
  }
}

/**
 * Internal Server Error - 500
 */
class InternalServerError extends AppError {
  constructor(message = 'Internal server error', errorCode = 'INTERNAL_ERROR') {
    super(message, 500, errorCode, true);
  }
}

/**
 * Game Error - 400
 */
class GameError extends AppError {
  constructor(message = 'Game operation failed', errorCode = 'GAME_ERROR') {
    super(message, 400, errorCode);
  }
}

/**
 * Socket Error - 400
 */
class SocketError extends AppError {
  constructor(message = 'Socket operation failed', errorCode = 'SOCKET_ERROR') {
    super(message, 400, errorCode);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  InternalServerError,
  GameError,
  SocketError,
};
