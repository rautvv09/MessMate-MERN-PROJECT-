const Booking = require('../models/Booking');
const MessListing = require('../models/MessListing');
const Notification = require('../models/Notification');
const calculateBookingPrice = require('../utils/calculateBookingPrice');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const VALID_PLANS = ['Full Day', 'Lunch & Dinner', 'Lunch Only', 'Dinner Only'];
const VALID_DURATIONS = [1, 3, 6];

// helper: how many confirmed bookings currently occupy seats at this mess
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

// @desc    Create a booking (auto-waitlists if mess is full)
// @route   POST /api/messes/:messId/bookings
exports.createBooking = catchAsync(async (req, res, next) => {
  const { planType, durationMonths, joiningDate } = req.body;

  if (!VALID_PLANS.includes(planType) || !VALID_DURATIONS.includes(Number(durationMonths))) {
    return next(new AppError('Invalid plan type or duration', 400));
  }

  const parsedJoiningDate = new Date(joiningDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsedJoiningDate < today) {
    return next(new AppError('Joining date cannot be in the past', 400));
  }

  const mess = await MessListing.findOne({ _id: req.params.messId, isActive: true });
  if (!mess) {
    return next(new AppError('Mess not found', 404));
  }

  // Server-side price calculation — the client never dictates the amount charged
  const priceSnapshot = calculateBookingPrice(mess, planType, Number(durationMonths));

  const occupiedSeats = await getOccupiedSeats(mess._id);
  const status = occupiedSeats < mess.totalSeats ? 'confirmed' : 'waitlisted';

  const booking = await Booking.create({
    studentId: req.user._id,
    messId: mess._id,
    planType,
    durationMonths: Number(durationMonths),
    joiningDate: parsedJoiningDate,
    priceSnapshot,
    status,
  });

  await Notification.create({
    userId: req.user._id,
    type: status === 'confirmed' ? 'booking_success' : 'booking_waitlisted',
    message:
      status === 'confirmed'
        ? `Your booking at ${mess.name} (${booking.bookingId}) is confirmed!`
        : `${mess.name} is currently full. You've been added to the waitlist (${booking.bookingId}).`,
    relatedEntity: { type: 'Booking', id: booking._id },
  });

  res.status(201).json({ success: true, data: { booking } });
});

// @desc    Get logged-in student's booking history
// @route   GET /api/bookings/me
exports.getMyBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ studentId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('messId', 'name city address gallery');

  res.status(200).json({ success: true, results: bookings.length, data: { bookings } });
});

// @desc    Get a single booking (receipt view)
// @route   GET /api/bookings/:id
exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findOne({ _id: req.params.id, studentId: req.user._id })
    .populate('messId', 'name city address pricing');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  res.status(200).json({ success: true, data: { booking } });
});

// @desc    Cancel a booking, and promote the next waitlisted student if a seat frees up
// @route   PATCH /api/bookings/:id/cancel
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const { cancellationReason } = req.body;

  const booking = await Booking.findOne({ _id: req.params.id, studentId: req.user._id });

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (booking.status === 'cancelled') {
    return next(new AppError('This booking is already cancelled', 400));
  }

  const wasConfirmed = booking.status === 'confirmed';

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancellationReason = cancellationReason || null;
  await booking.save();

  await Notification.create({
    userId: req.user._id,
    type: 'booking_cancelled',
    message: `Your booking (${booking.bookingId}) has been cancelled.`,
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

  res.status(200).json({ success: true, data: { booking } });
});