const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  saveAttendanceValidation,
  getAttendanceValidation,
} = require('../validators/attendanceValidators');
const {
  getAttendance,
  saveAttendance,
  getAttendanceSummary,
} = require('../controllers/attendanceController');

const router = express.Router();

// All attendance routes require an authenticated owner
router.use(protect, restrictTo('owner'));

// GET  /api/owner/messes/:messId/attendance?date=2026-08-06
// Returns the full attendance sheet (students + pre-filled records)
router.get(
  '/messes/:messId/attendance',
  getAttendanceValidation,
  validate,
  getAttendance
);

// POST /api/owner/messes/:messId/attendance
// Save attendance for all students on a given date (bulk upsert)
router.post(
  '/messes/:messId/attendance',
  saveAttendanceValidation,
  validate,
  saveAttendance
);

// GET  /api/owner/messes/:messId/attendance/summary?date=2026-08-06
// Quick stats: total students, breakfast/lunch/dinner present, on leave
router.get(
  '/messes/:messId/attendance/summary',
  getAttendanceValidation,
  validate,
  getAttendanceSummary
);

module.exports = router;
