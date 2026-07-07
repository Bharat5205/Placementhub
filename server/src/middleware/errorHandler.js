const { AppError } = require('../utils/appError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // PostgreSQL errors
  if (err.code === '23505') {
    statusCode = 409;
    message = `Database Error (Duplicate): ${err.detail || err.message}`;
  } else if (err.code === '23503') {
    statusCode = 400;
    message = `Database Error (Foreign Key): ${err.detail || err.message}`;
  } else if (err.code === '22P02') {
    statusCode = 400;
    message = `Database Error (Invalid format): ${err.message}`;
  } else if (err.code) {
    message = `Database Error: ${err.message}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = `JWT Error: ${err.message}`;
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = `JWT Error: ${err.message}`;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
