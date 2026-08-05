const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Not authorized, no token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(new AppError('Not authorized, invalid or expired token', 401));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists', 401));
  }

  if (!user.isActive) {
    return next(new AppError('This account has been deactivated', 403));
  }

  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`This action is restricted to: ${roles.join(', ')}`, 403)
      );
    }
    next();
  };
};