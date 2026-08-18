const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { param, query } = require('express-validator');
const {
  getRevenueReport,
  getAttendanceReport,
  getStudentReport,
} = require('../controllers/reportingController');

const router = express.Router();

// All reporting routes require an authenticated owner
router.use(protect, restrictTo('owner'));

const messIdValidation = [
  param('messId').isMongoId().withMessage('Invalid mess ID'),
];

// GET /api/owner/messes/:messId/reports/revenue?months=6
router.get(
  '/messes/:messId/reports/revenue',
  [
    ...messIdValidation,
    query('months')
      .optional()
      .isInt({ min: 1, max: 24 })
      .withMessage('Months must be between 1 and 24'),
  ],
  validate,
  getRevenueReport
);

// GET /api/owner/messes/:messId/reports/attendance
router.get(
  '/messes/:messId/reports/attendance',
  messIdValidation,
  validate,
  getAttendanceReport
);

// GET /api/owner/messes/:messId/reports/students
router.get(
  '/messes/:messId/reports/students',
  messIdValidation,
  validate,
  getStudentReport
);

module.exports = router;
