const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.protect = catchAsync(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new AppError('Not authenticated. Please log in.', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Session expired', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid session. Please log in again.', 401));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError('The user belonging to this session no longer exists', 401));
  }
  if (!user.isActive || user.status === 'suspended' || user.status === 'inactive') {
    return next(
      new AppError(
        user.status === 'suspended'
          ? 'Your account has been suspended by an administrator. Please contact support.'
          : 'This account has been deactivated.',
        403
      )
    );
  }

  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`This action is restricted to: ${roles.join(', ')}`, 403));
    }
    next();
  };
};

// Aliases for clear requirement mapping
exports.authenticateUser = exports.protect;
exports.requireAdmin = exports.restrictTo('admin');