const catchAsync = require('../utils/catchAsync');
const {
  getAttendanceSheet,
  saveAttendance,
  getAttendanceSummary,
} = require('../services/attendanceService');

// @desc    Get the attendance sheet for a specific mess on a specific date.
//          Returns all booked students with their plan types, applicable meals,
//          and any pre-existing attendance records (pre-filled form data).
// @route   GET /api/owner/messes/:messId/attendance?date=2026-08-06
// @access  Owner only (enforced by router-level middleware)
exports.getAttendance = catchAsync(async (req, res) => {
  const { messId } = req.params;
  const { date } = req.query;

  const sheet = await getAttendanceSheet(messId, req.user._id, date);

  res.status(200).json({
    success: true,
    data: sheet,
  });
});

// @desc    Save (upsert) attendance for all booked students on a given date.
//          Accepts an array of records — one per student — and performs a single
//          bulk write to MongoDB. Validates mess ownership, booking validity,
//          and billing locks before persisting.
// @route   POST /api/owner/messes/:messId/attendance
// @access  Owner only
exports.saveAttendance = catchAsync(async (req, res) => {
  const { messId } = req.params;
  const { date, records } = req.body;

  const result = await saveAttendance(messId, req.user._id, date, records);

  res.status(200).json({
    success: true,
    message: `Attendance saved successfully for ${result.total} student(s)`,
    data: result,
  });
});

// @desc    Get aggregated attendance summary stats for a mess on a given date.
//          Returns counts: total students, breakfast/lunch/dinner present, on leave.
// @route   GET /api/owner/messes/:messId/attendance/summary?date=2026-08-06
// @access  Owner only
exports.getAttendanceSummary = catchAsync(async (req, res) => {
  const { messId } = req.params;
  const { date } = req.query;

  const summary = await getAttendanceSummary(messId, date);

  res.status(200).json({
    success: true,
    data: summary,
  });
});
   