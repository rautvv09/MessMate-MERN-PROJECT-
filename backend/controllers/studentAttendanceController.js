const catchAsync = require('../utils/catchAsync');
const {
  getStudentBookings,
  getMonthlyStats,
  getMonthlyCalendar,
  getAttendanceHistory,
} = require('../services/studentAttendanceService');

// @desc    Get the student's active bookings (for mess selector dropdown)
// @route   GET /api/student/attendance/bookings
// @access  Student only
exports.getMyAttendanceBookings = catchAsync(async (req, res) => {
  const bookings = await getStudentBookings(req.user._id);

  res.status(200).json({
    success: true,
    results: bookings.length,
    data: { bookings },
  });
});

// @desc    Get monthly attendance statistics (meals taken, missed, %)
// @route   GET /api/student/attendance/stats?bookingId=...&year=2026&month=8
// @access  Student only
exports.getMyMonthlyStats = catchAsync(async (req, res) => {
  const { bookingId, year, month } = req.query;

  const stats = await getMonthlyStats(
    req.user._id,
    bookingId,
    parseInt(year, 10),
    parseInt(month, 10)
  );

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// @desc    Get daily attendance records for a month (calendar view)
// @route   GET /api/student/attendance/calendar?bookingId=...&year=2026&month=8
// @access  Student only
exports.getMyMonthlyCalendar = catchAsync(async (req, res) => {
  const { bookingId, year, month } = req.query;

  const calendar = await getMonthlyCalendar(
    req.user._id,
    bookingId,
    parseInt(year, 10),
    parseInt(month, 10)
  );

  res.status(200).json({
    success: true,
    results: calendar.length,
    data: { days: calendar },
  });
});

// @desc    Get paginated attendance history (most recent first)
// @route   GET /api/student/attendance/history?page=1&limit=30
// @access  Student only
exports.getMyAttendanceHistory = catchAsync(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;

  const result = await getAttendanceHistory(
    req.user._id,
    parseInt(page, 10),
    parseInt(limit, 10)
  );

  res.status(200).json({
    success: true,
    results: result.records.length,
    data: result,
  });
});

// @desc    Student marks their own attendance for a date
// @route   POST /api/student/attendance/mark
// @access  Student only
exports.markStudentAttendance = catchAsync(async (req, res) => {
  const { markStudentAttendance } = require('../services/studentAttendanceService');
  const record = await markStudentAttendance(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Attendance saved and monthly bill updated successfully',
    data: { record },
  });
});
