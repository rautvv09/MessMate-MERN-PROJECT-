const Booking = require('../models/Booking');
const MessListing = require('../models/MessListing');
const Notification = require('../models/Notification');
const calculateBookingPrice = require('../utils/calculateBookingPrice');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const VALID_PLANS = ['Full Day', 'Lunch & Dinner', 'Lunch Only', 'Dinner Only'];
const VALID_DURATIONS = [1, 3, 6];

// Helper: auto-expire past confirmed bookings where endDate < now
const expirePastBookings = async (studentId = null) => {
  try {
    const query = {
      status: 'confirmed',
      endDate: { $lt: new Date() },
    };
    if (studentId) query.studentId = studentId;

    await Booking.updateMany(query, { $set: { status: 'completed' } });
  } catch (err) {
    console.error('[Expire Past Bookings Error]:', err.message);
  }
};

// Helper: how many confirmed bookings currently occupy seats at this mess
const getOccupiedSeats = (messId) =>
  Booking.countDocuments({ messId, status: 'confirmed' });

// @desc    Preview price breakdown before booking (no data is saved)
// @route   GET /api/messes/:messId/booking-preview
exports.previewPrice = catchAsync(async (req, res, next) => {
  const { planType, durationMonths } = req.query;

  if (!VALID_PLANS.includes(planType) || !VALID_DURATIONS.includes(Number(durationMonths))) {
    return next(new AppError('Invalid plan type or duration', 400));
  }

  const mess = await MessListing.findOne({ _id: req.params.messId, isActive: true });
  if (!mess) {
    return next(new AppError('Mess not found', 404));
  }

  const priceBreakdown = calculateBookingPrice(mess, planType, Number(durationMonths));

  res.status(200).json({ success: true, data: { priceBreakdown } });
});

// @desc    Get student's current active subscription (if any)
// @route   GET /api/bookings/active or GET /api/subscriptions/active
exports.getActiveSubscription = catchAsync(async (req, res) => {
  await expirePastBookings(req.user._id);

  const activeBooking = await Booking.findOne({
    studentId: req.user._id,
    status: 'confirmed',
    $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
  }).populate('messId', 'name city address pricing mealPricing gallery');

  res.status(200).json({
    success: true,
    data: {
      hasActiveSubscription: !!activeBooking,
      activeSubscription: activeBooking
        ? {
            ...activeBooking.toObject(),
            status: 'ACTIVE',
          }
        : null,
    },
  });
});

// @desc    Create a booking / subscription (Enforces 1 Student -> 1 Active Subscription rule)
// @route   POST /api/messes/:messId/bookings or POST /api/subscriptions
exports.createBooking = catchAsync(async (req, res, next) => {
  const { planType, durationMonths, joiningDate } = req.body;
  const messId = req.params.messId || req.body.messId;

  if (!VALID_PLANS.includes(planType) || !VALID_DURATIONS.includes(Number(durationMonths))) {
    return next(new AppError('Invalid plan type or duration', 400));
  }

  const parsedJoiningDate = new Date(joiningDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(parsedJoiningDate.getTime()) || parsedJoiningDate < today) {
    return next(new AppError('Joining date must be a valid future date', 400));
  }

  // 1. Auto-expire any completed subscriptions first
  await expirePastBookings(req.user._id);

  // 2. Strict check: Student can have ONLY ONE active mess subscription at a time
  const existingActiveSubscription = await Booking.findOne({
    studentId: req.user._id,
    status: 'confirmed',
    $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
  }).populate('messId', 'name city');

  if (existingActiveSubscription) {
    const isSameMess = existingActiveSubscription.messId?._id?.toString() === messId.toString();

    return res.status(409).json({
      success: false,
      message: isSameMess
        ? 'You already have an active subscription for this mess.'
        : `You already have an active subscription with ${
            existingActiveSubscription.messId?.name || 'another mess'
          }. Cancel your current subscription before subscribing to another mess.`,
      activeSubscription: {
        messId: existingActiveSubscription.messId?._id,
        messName: existingActiveSubscription.messId?.name,
        subscriptionId: existingActiveSubscription._id,
        bookingId: existingActiveSubscription.bookingId,
        planType: existingActiveSubscription.planType,
        startDate: existingActiveSubscription.startDate || existingActiveSubscription.joiningDate,
        endDate: existingActiveSubscription.endDate,
        status: 'ACTIVE',
      },
    });
  }

  const mess = await MessListing.findOne({ _id: messId, isActive: true });
  if (!mess) {
    return next(new AppError('Mess not found or inactive', 404));
  }

  // Server-side price calculation
  const priceSnapshot = calculateBookingPrice(mess, planType, Number(durationMonths));

  const occupiedSeats = await getOccupiedSeats(mess._id);
  const status = occupiedSeats < mess.totalSeats ? 'confirmed' : 'waitlisted';

  // Calculate calculated end date
  const calculatedEndDate = new Date(parsedJoiningDate);
  calculatedEndDate.setMonth(calculatedEndDate.getMonth() + Number(durationMonths));

  let booking;
  try {
    booking = await Booking.create({
      studentId: req.user._id,
      messId: mess._id,
      planType,
      durationMonths: Number(durationMonths),
      joiningDate: parsedJoiningDate,
      startDate: parsedJoiningDate,
      endDate: calculatedEndDate,
      priceSnapshot,
      status,
    });
  } catch (err) {
    // Catch database-level race condition / partial unique index collision
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          'You already have an active mess subscription. Duplicate active subscriptions are not permitted.',
      });
    }
    throw err;
  }

  await Notification.create({
    userId: req.user._id,
    type: status === 'confirmed' ? 'booking_success' : 'booking_waitlisted',
    message:
      status === 'confirmed'
        ? `Your subscription at ${mess.name} (${booking.bookingId}) is confirmed and active!`
        : `${mess.name} is currently full. You've been added to the waitlist (${booking.bookingId}).`,
    relatedEntity: { type: 'Booking', id: booking._id },
  });

  res.status(201).json({ success: true, data: { booking } });
});

// @desc    Get logged-in student's booking history
// @route   GET /api/bookings/me or GET /api/subscriptions/me
exports.getMyBookings = catchAsync(async (req, res) => {
  await expirePastBookings(req.user._id);

  const bookings = await Booking.find({ studentId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('messId', 'name city address gallery pricing mealPricing');

  res.status(200).json({ success: true, results: bookings.length, data: { bookings } });
});

// @desc    Get a single booking (receipt view)
// @route   GET /api/bookings/:id or GET /api/subscriptions/:id
exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findOne({ _id: req.params.id, studentId: req.user._id })
    .populate('messId', 'name city address pricing mealPricing');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  res.status(200).json({ success: true, data: { booking } });
});

// @desc    Cancel a booking / subscription, and promote the next waitlisted student if a seat frees up
// @route   PATCH /api/bookings/:id/cancel or POST /api/subscriptions/:id/cancel
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const { cancellationReason } = req.body;

  const booking = await Booking.findOne({ _id: req.params.id, studentId: req.user._id });

  if (!booking) {
    return next(new AppError('Booking or subscription not found', 404));
  }

  if (booking.status === 'cancelled') {
    return next(new AppError('This subscription is already cancelled', 400));
  }

  const wasConfirmed = booking.status === 'confirmed';

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancellationReason = cancellationReason || 'Cancelled by student';
  await booking.save();

  await Notification.create({
    userId: req.user._id,
    type: 'booking_cancelled',
    message: `Your subscription (${booking.bookingId}) has been cancelled successfully. You may now subscribe to another mess.`,
    relatedEntity: { type: 'Booking', id: booking._id },
  });

  // A confirmed seat just freed up — promote the oldest waitlisted booking for this mess, if any
  if (wasConfirmed) {
    const promoted = await Booking.findOneAndUpdate(
      { messId: booking.messId, status: 'waitlisted' },
      { status: 'confirmed' },
      { sort: { createdAt: 1 }, new: true }
    );

    if (promoted) {
      const mess = await MessListing.findById(booking.messId).select('name');
      await Notification.create({
        userId: promoted.studentId,
        type: 'booking_success',
        message: `Good news! A seat opened up at ${mess.name}. Your booking (${promoted.bookingId}) is now confirmed.`,
        relatedEntity: { type: 'Booking', id: promoted._id },
      });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Subscription cancelled successfully',
    data: { booking },
  });
});