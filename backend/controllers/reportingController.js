const catchAsync = require('../utils/catchAsync');
const {
  getRevenueAnalytics,
  getAttendanceAnalytics,
  getStudentAnalytics,
} = require('../services/reportingService');

// @desc    Get revenue analytics for a mess (last N months)
// @route   GET /api/owner/messes/:messId/reports/revenue?months=6
// @access  Owner only
exports.getRevenueReport = catchAsync(async (req, res) => {
  const months = req.query.months ? parseInt(req.query.months, 10) : 6;
  
  const data = await getRevenueAnalytics(req.params.messId, req.user._id, months);

  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Get attendance analytics for a mess (last 30 days)
// @route   GET /api/owner/messes/:messId/reports/attendance
// @access  Owner only
exports.getAttendanceReport = catchAsync(async (req, res) => {
  const data = await getAttendanceAnalytics(req.params.messId, req.user._id);

  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Get student and plan distribution analytics
// @route   GET /api/owner/messes/:messId/reports/students
// @access  Owner only
exports.getStudentReport = catchAsync(async (req, res) => {
  const data = await getStudentAnalytics(req.params.messId, req.user._id);

  res.status(200).json({
    success: true,
    data,
  });
});
