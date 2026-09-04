const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Alternatively check cookies
  else if (req.cookies && (req.cookies.token || req.cookies.accessToken)) {
    token = req.cookies.token || req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No access token provided',
      code: 'NO_TOKEN'
    });
  }

  try {
    const accessSecret =
      process.env.JWT_ACCESS_SECRET ||
      process.env.JWT_SECRET ||
      'rojgar_access_token_super_secret_key_2026_x9a8f7b6';

    const decoded = jwt.verify(token, accessSecret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked',
        code: 'ACCOUNT_BLOCKED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED',
        isExpired: true
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      code: 'INVALID_TOKEN'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

