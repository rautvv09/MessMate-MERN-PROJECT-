const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Get logged-in user's profile
// @route   GET /api/users/me
exports.getProfile = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user.toSafeObject() },
  });
});

// @desc    Update profile (name, phone, roleDetails — never email or role)
// @route   PATCH /api/users/me
exports.updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ['name', 'phone'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // roleDetails sub-fields, updated individually to avoid overwriting the whole object
  if (req.user.role === 'student') {
    if (req.body.college !== undefined) updates['roleDetails.college'] = req.body.college;
    if (req.body.city !== undefined) updates['roleDetails.city'] = req.body.city;
  }
  if (req.user.role === 'owner') {
    if (req.body.businessName !== undefined) updates['roleDetails.businessName'] = req.body.businessName;
    if (req.body.address !== undefined) updates['roleDetails.address'] = req.body.address;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: { user: updatedUser.toSafeObject() },
  });
});

// @desc    Upload/change avatar
// @route   PATCH /api/users/me/avatar
exports.updateAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
  }

  // Delete old avatar from Cloudinary first, if one exists
  if (req.user.avatarPublicId) {
    await cloudinary.uploader.destroy(req.user.avatarPublicId);
  }

  const result = await uploadToCloudinary(req.file.buffer, 'messmate/avatars');

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      avatarUrl: result.secure_url,
      avatarPublicId: result.public_id,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: { user: updatedUser.toSafeObject() },
  });
});