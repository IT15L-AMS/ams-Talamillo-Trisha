
const errorHandler = (err, req, res, next) => {
  // Log error
  console.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let response = {
    success: false,
    message: err.message || "Internal Server Error",
    code: err.code || "INTERNAL_ERROR",
  };

  // Database errors
  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    response.message = "Duplicate entry - Email already exists";
    response.code = "DUPLICATE_EMAIL";
  }

  // Database connection error
  if (
    err.code === "PROTOCOL_CONNECTION_LOST" ||
    err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR" ||
    err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"
  ) {
    statusCode = 503;
    response.message = "Database connection failed";
    response.code = "DB_CONNECTION_ERROR";
  }

  // Validation errors
  if (err.statusCode === 400) {
    statusCode = 400;
    response.message = err.message;
    response.code = "VALIDATION_ERROR";
    if (err.errors) {
      response.errors = err.errors;
    }
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    code: "NOT_FOUND",
    path: req.path,
  });
};

/**
 * Async error wrapper for try-catch in route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
