const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Register a new student
// @route   POST /api/auth/register/student
exports.registerStudent = catchAsync(async (req, res, next) => {
  const { name, email, password, phone, college, city } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email is already registered', 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'student',
    roleDetails: { college, city },
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    data: { user: user.toSafeObject(), token },
  });
});

// @desc    Register a new mess owner
// @route   POST /api/auth/register/owner
exports.registerOwner = catchAsync(async (req, res, next) => {
  const { name, email, password, phone, businessName, address } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email is already registered', 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'owner',
    roleDetails: { businessName, address },
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    data: { user: user.toSafeObject(), token },
  });
});

// @desc    Login (both roles)
// @route   POST /api/auth/login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('This account has been deactivated', 403));
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    data: { user: user.toSafeObject(), token },
  });
});

// @desc    Get currently logged-in user
// @route   GET /api/auth/me
exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user.toSafeObject() },
  });
});