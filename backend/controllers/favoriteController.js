const Favorite = require('../models/Favorite');
const MessListing = require('../models/MessListing');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Favorite a mess
// @route   POST /api/messes/:messId/favorite
exports.addFavorite = catchAsync(async (req, res, next) => {
  const { messId } = req.params;

  const mess = await MessListing.findOne({ _id: messId, isActive: true });
  if (!mess) {
    return next(new AppError('Mess not found', 404));
  }

  try {
    const favorite = await Favorite.create({ studentId: req.user._id, messId });
    return res.status(201).json({ success: true, data: { favorite } });
  } catch (error) {
    // E11000 = duplicate key — this is an expected, normal outcome here, not a real error
    if (error.code === 11000) {
      return res.status(200).json({ success: true, message: 'Already favorited' });
    }
    throw error; // anything else genuinely is unexpected — let catchAsync/errorHandler deal with it
  }
});

// @desc    Remove a mess from favorites
// @route   DELETE /api/messes/:messId/favorite
exports.removeFavorite = catchAsync(async (req, res, next) => {
  const favorite = await Favorite.findOneAndDelete({
    studentId: req.user._id,
    messId: req.params.messId,
  });

  if (!favorite) {
    return next(new AppError('Favorite not found', 404));
  }

  res.status(200).json({ success: true, message: 'Removed from favorites', data: null });
});

// @desc    Get the logged-in student's full favorites list, populated with mess details
// @route   GET /api/favorites/me
exports.getMyFavorites = catchAsync(async (req, res) => {
  const favorites = await Favorite.find({ studentId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('messId', 'name city rating pricing.baseFee gallery isActive');

  // A favorited mess might have since been soft-deleted by its owner — filter those out
  // rather than showing a broken card on the frontend
  const validFavorites = favorites.filter((fav) => fav.messId && fav.messId.isActive);

  res.status(200).json({
    success: true,
    results: validFavorites.length,
    data: { favorites: validFavorites },
  });
});

// @desc    Batch-check which of a given list of mess IDs are favorited by this student
// @route   POST /api/favorites/check
exports.checkFavorites = catchAsync(async (req, res, next) => {
  const { messIds } = req.body;

  if (!Array.isArray(messIds) || messIds.length === 0) {
    return next(new AppError('messIds must be a non-empty array', 400));
  }

  const favorites = await Favorite.find({
    studentId: req.user._id,
    messId: { $in: messIds },
  }).select('messId');

  const favoritedIds = favorites.map((f) => f.messId.toString());

  res.status(200).json({ success: true, data: { favoritedIds } });
});