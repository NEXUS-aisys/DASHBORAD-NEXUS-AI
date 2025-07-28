
/**
 * Custom API Error class for standardized error handling
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {string} message - The error message
   * @param {number} statusCode - The HTTP status code
   * @param {boolean} isOperational - Whether this is an operational error
   */
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
