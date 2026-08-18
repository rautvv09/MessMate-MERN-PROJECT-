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
    .populate('studentId', 'name email phone roleDetails avatarUrl avatar');

  res.status(200).json({
    success: true,
    results: bookings.length,
    data: { bookings },
  });
});

// @desc    Get all enrolled students for an owner's mess with basic info
// @route   GET /api/owner/messes/:messId/students
exports.getMessStudents = catchAsync(async (req, res, next) => {
  const mess = await MessListing.findOne({ _id: req.params.messId, ownerId: req.user._id });
  if (!mess) {
    return res.status(404).json({ success: false, message: 'Mess not found or not owned by you' });
  }

  const bookings = await Booking.find({ messId: mess._id, status: 'confirmed' })
    .populate('studentId', 'name email phone roleDetails avatarUrl avatar')
    .sort({ createdAt: -1 });

  const studentsMap = new Map();
  bookings.forEach((b) => {
    if (b.studentId && !studentsMap.has(b.studentId._id.toString())) {
      studentsMap.set(b.studentId._id.toString(), {
        bookingId: b._id,
        _id: b.studentId._id,
        name: b.studentId.name,
        email: b.studentId.email,
        phone: b.studentId.phone || 'N/A',
        collegeName: b.studentId.roleDetails?.college || b.studentId.roleDetails?.collegeName || 'N/A',
        avatarUrl: b.studentId.avatarUrl || b.studentId.avatar || '',
        startDate: b.startDate || b.createdAt,
        planType: b.planType,
      });
    }
  });

  res.status(200).json({
    success: true,
    data: { students: Array.from(studentsMap.values()) },
  });
});

// @desc    Get month-wise attendance calendar for a specific student in an owner's mess
// @route   GET /api/owner/messes/:messId/students/:studentId/attendance?year=2026&month=8
exports.getStudentAttendanceForOwner = catchAsync(async (req, res, next) => {
  const { messId, studentId } = req.params;
  const year = Number(req.query.year) || new Date().getFullYear();
  const month = Number(req.query.month) || new Date().getMonth() + 1;

  const mess = await MessListing.findOne({ _id: messId, ownerId: req.user._id });
  if (!mess) {
    return res.status(404).json({ success: false, message: 'Mess not found or not owned by you' });
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const Attendance = require('../models/Attendance');
  const records = await Attendance.find({
    messId,
    studentId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });

  res.status(200).json({
    success: true,
    data: { year, month, records },
  });
});