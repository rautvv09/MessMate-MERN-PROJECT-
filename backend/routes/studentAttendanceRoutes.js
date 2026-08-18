const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  monthlyQueryValidation,
  historyQueryValidation,
} = require('../validators/studentAttendanceValidators');
const {
  getMyAttendanceBookings,
  getMyMonthlyStats,
  getMyMonthlyCalendar,
  getMyAttendanceHistory,
  markStudentAttendance,
} = require('../controllers/studentAttendanceController');

const router = express.Router();

// All routes below require an authenticated student
router.use(protect, restrictTo('student'));

// GET /api/student/attendance/bookings
// Returns the student's active bookings (for the mess selector)
router.get('/bookings', getMyAttendanceBookings);

// GET /api/student/attendance/stats?bookingId=...&year=2026&month=8
// Returns aggregated monthly attendance statistics
router.get('/stats', monthlyQueryValidation, validate, getMyMonthlyStats);

// GET /api/student/attendance/calendar?bookingId=...&year=2026&month=8
// Returns daily attendance records for the calendar grid
router.get('/calendar', monthlyQueryValidation, validate, getMyMonthlyCalendar);

// GET /api/student/attendance/history?page=1&limit=30
// Returns paginated attendance history (most recent first)
router.get('/history', historyQueryValidation, validate, getMyAttendanceHistory);

// POST /api/student/attendance/mark
// Mark student's own attendance for a date
router.post('/mark', markStudentAttendance);

module.exports = router;
