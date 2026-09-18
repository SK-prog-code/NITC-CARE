const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Not authorized to access this resource. No token provided.',
      error: 'Unauthorized',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'ccms_jwt_default_secret_key_2026'
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'The user belonging to this token no longer exists.',
        error: 'UserNotFound',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid or expired authentication token.',
      error: 'TokenExpiredOrInvalid',
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route.`,
        error: 'Forbidden',
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
