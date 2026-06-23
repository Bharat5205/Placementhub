const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/appError');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('[Auth Middleware] Authentication required - Missing or malformed Authorization header.');
    return next(new AppError('Authentication required', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const decodedExpired = jwt.decode(token);
      console.warn(`[Auth Middleware] JWT Access Token expired. Expired token email: ${decodedExpired?.email || 'unknown'} | Expired at: ${new Date(decodedExpired?.exp * 1000).toISOString()}`);
      return next(new AppError('Token expired', 401));
    }
    console.error(`[Auth Middleware] JWT Access Token verification failed: ${err.message}`);
    return next(new AppError('Invalid token', 401));
  }
};

module.exports = { authenticate };
