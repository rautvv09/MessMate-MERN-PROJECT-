const { body, param, query } = require('express-validator');

const VALID_MEAL_STATUSES = ['present', 'absent', 'leave', 'holiday', 'late'];

// Validates a single meal entry in the attendance records array.
// Each meal must have a status from the allowed enum.
const mealStatusValidator = (mealField) =>
  body(`records.*.${mealField}`)
    .isIn(VALID_MEAL_STATUSES)
    .withMessage(`${mealField} status must be one of: ${VALID_MEAL_STATUSES.join(', ')}`);

// POST /api/owner/messes/:messId/attendance
// Body: { date: "2026-08-06", records: [{ studentId, bookingId, breakfast, lunch, dinner, notes? }] }
exports.saveAttendanceValidation = [
  param('messId')
    .isMongoId()
    .withMessage('Invalid mess ID'),

  body('date')
    .notEmpty()
    .withMessage('Attendance date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date string')
    .custom((value) => {
      const attendanceDate = new Date(value);
      attendanceDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (attendanceDate > today) {
        throw new Error('Cannot mark attendance for a future date');
      }
      return true;
    }),

  body('records')
    .isArray({ min: 1 })
    .withMessage('At least one attendance record is required'),

  body('records.*.studentId')
    .isMongoId()
    .withMessage('Each record must have a valid student ID'),

  body('records.*.bookingId')
    .isMongoId()
    .withMessage('Each record must have a valid booking ID'),

  mealStatusValidator('breakfast'),
  mealStatusValidator('lunch'),
  mealStatusValidator('dinner'),

  body('records.*.notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

// GET /api/owner/messes/:messId/attendance?date=2026-08-06
exports.getAttendanceValidation = [
  param('messId')
    .isMongoId()
    .withMessage('Invalid mess ID'),

  query('date')
    .notEmpty()
    .withMessage('Date query parameter is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date string'),
];
