/**
 * Shared Types and Interfaces
 * Used for cross-module communication in Modular Monolith architecture
 */

// Common response structure
class ApiResponse {
  constructor(success, data, message) {
    this.success = success;
    this.data = data;
    this.message = message;
  }

  static success(data, message = null) {
    return new ApiResponse(true, data, message);
  }

  static error(message, data = null) {
    return new ApiResponse(false, data, message);
  }
}

// Common error types
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

module.exports = {
  ApiResponse,
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError
};
