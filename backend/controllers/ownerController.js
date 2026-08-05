const mongoose = require('mongoose');
const MessListing = require('../models/MessListing');
const Booking = require('../models/Booking');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all messes owned by the logged-in owner
// @route   GET /api/owner/messes
exports.getMyMesses = catchAsync(async (req, res) => {
  const messes = await MessListing.find({ ownerId: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: messes.length,
    data: { messes },
  });
});

// @desc    Owner dashboard summary — Total Students, Monthly Income, Available Seats
// @route   GET /api/owner/dashboard
exports.getDashboardStats = catchAsync(async (req, res) => {
  const ownerId = new mongoose.Types.ObjectId(req.user._id);

  // Step 1: get all mess IDs and total seats owned by this owner
  const messes = await MessListing.find({ ownerId }).select('_id totalSeats name');
  const messIds = messes.map((m) => m._id);
  const totalSeatsAcrossMesses = messes.reduce((sum, m) => sum + m.totalSeats, 0);

  if (messIds.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        totalStudents: 0,
        monthlyIncome: 0,
        totalSeats: 0,
        occupiedSeats: 0,
        availableSeats: 0,
        messCount: 0,
      },
    });
  }

  // Step 2: aggregate confirmed bookings across all owned messes
  const stats = await Booking.aggregate([
    {
      $match: {
        messId: { $in: messIds },
        status: 'confirmed',
      },
    },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        monthlyIncome: { $sum: '$priceSnapshot.totalPayable' },
      },
    },
  ]);

  const { totalStudents = 0, monthlyIncome = 0 } = stats[0] || {};
  const occupiedSeats = totalStudents;
  const availableSeats = Math.max(totalSeatsAcrossMesses - occupiedSeats, 0);

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      monthlyIncome,
      totalSeats: totalSeatsAcrossMesses,
      occupiedSeats,
      availableSeats,
      messCount: messes.length,
    },
  });
});

// @desc    Per-mess booking list (for a specific owned mess)
// @route   GET /api/owner/messes/:messId/bookings
exports.getMessBookings = catchAsync(async (req, res, next) => {
  const mess = await MessListing.findOne({ _id: req.params.messId, ownerId: req.user._id });

  if (!mess) {
    return res.status(404).json({ success: false, message: 'Mess not found or not owned by you' });
  }

  const bookings = await Booking.find({ messId: mess._id })
    .sort({ createdAt: -1 })
    .populate('studentId', 'name email phone');

  res.status(200).json({
    success: true,
    results: bookings.length,
    data: { bookings },
  });
});