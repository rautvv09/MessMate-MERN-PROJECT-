const Review = require('../models/Review');
const MessListing = require('../models/MessListing');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Create a review, or edit if one already exists for this student+mess
// @route   POST /api/messes/:messId/reviews
exports.createOrEditReview = catchAsync(async (req, res, next) => {
  const { rating, comment } = req.body;
  const { messId } = req.params;

  const mess = await MessListing.findOne({ _id: messId, isActive: true });
  if (!mess) {
    return next(new AppError('Mess not found', 404));
  }

  // ---- OPTIONAL: enforce booking-required reviews (currently disabled — see module notes) ----
  // const hasBooked = await Booking.exists({
  //   studentId: req.user._id,
  //   messId,
  //   status: { $in: ['confirmed', 'completed'] },
  // });
  // if (!hasBooked) {
  //   return next(new AppError('You must have a booking with this mess to leave a review', 403));
  // }

  let review = await Review.findOne({ studentId: req.user._id, messId });
  let statusCode = 201;

  if (review) {
    review.rating = rating;
    review.comment = comment;
    review.isEdited = true;
    await review.save(); // post('save') hook fires → rating recalculated
    statusCode = 200;
  } else {
    review = await Review.create({ studentId: req.user._id, messId, rating, comment });
    // post('save') hook fires here too — create() triggers save middleware
  }

  res.status(statusCode).json({ success: true, data: { review } });
});

// @desc    Get paginated reviews for a mess
// @route   GET /api/messes/:messId/reviews
exports.getMessReviews = catchAsync(async (req, res) => {
  const { messId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ messId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('studentId', 'name avatarUrl'),
    Review.countDocuments({ messId }),
  ]);

  res.status(200).json({
    success: true,
    results: reviews.length,
    pagination: { total, page, pages: Math.ceil(total / limit) },
    data: { reviews },
  });
});

// @desc    Get the logged-in student's own review for a specific mess (for pre-filling an edit form)
// @route   GET /api/messes/:messId/reviews/me
exports.getMyReviewForMess = catchAsync(async (req, res) => {
  const review = await Review.findOne({ studentId: req.user._id, messId: req.params.messId });

  res.status(200).json({ success: true, data: { review: review || null } });
});

// @desc    Delete own review
// @route   DELETE /api/reviews/:id
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOneAndDelete({ _id: req.params.id, studentId: req.user._id });
  // post('findOneAndDelete') hook fires → rating recalculated

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  res.status(200).json({ success: true, message: 'Review deleted', data: null });
});