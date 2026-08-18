const { body, param, query } = require('express-validator');

// PUT /api/owner/messes/:messId/pricing
exports.updatePricingValidation = [
  param('messId').isMongoId().withMessage('Invalid mess ID'),

  body('breakfast')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Breakfast price must be a non-negative number'),

  body('lunch')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lunch price must be a non-negative number'),

  body('dinner')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Dinner price must be a non-negative number'),

  body('fullDay')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Full day price must be a non-negative number'),

  body('gstPercentage')
    .optional()
    .isFloat({ min: 0, max: 28 })
    .withMessage('GST percentage must be between 0 and 28'),
];

// GET /api/owner/messes/:messId/billing/billable?year=2026&month=8
exports.billableQueryValidation = [
  param('messId').isMongoId().withMessage('Invalid mess ID'),

  query('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2020, max: 2100 })
    .withMessage('Year must be between 2020 and 2100'),

  query('month')
    .notEmpty()
    .withMessage('Month is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
];

// POST /api/owner/messes/:messId/billing/generate
exports.generateBillValidation = [
  param('messId').isMongoId().withMessage('Invalid mess ID'),

  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID'),

  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2020, max: 2100 })
    .withMessage('Year must be between 2020 and 2100'),

  body('month')
    .notEmpty()
    .withMessage('Month is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),

  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a non-negative number'),

  body('deposit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Deposit must be a non-negative number'),

  body('registrationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Registration fee must be a non-negative number'),

  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
];

// GET /api/owner/messes/:messId/billing
exports.getBillsQueryValidation = [
  param('messId').isMongoId().withMessage('Invalid mess ID'),

  query('year')
    .optional()
    .isInt({ min: 2020, max: 2100 })
    .withMessage('Year must be between 2020 and 2100'),

  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),

  query('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'overdue', 'partially_paid'])
    .withMessage('Invalid payment status'),
];

// PATCH /api/owner/billing/:billId/payment
exports.updatePaymentValidation = [
  param('billId').isMongoId().withMessage('Invalid bill ID'),

  body('status')
    .notEmpty()
    .withMessage('Payment status is required')
    .isIn(['pending', 'paid', 'overdue', 'partially_paid'])
    .withMessage('Invalid payment status'),

  body('paidAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Paid amount must be a non-negative number'),

  body('paymentMethod')
    .optional()
    .isIn(['cash', 'upi', 'bank_transfer', 'card', 'other'])
    .withMessage('Invalid payment method'),
];

// GET/PDF params
exports.billIdValidation = [
  param('billId').isMongoId().withMessage('Invalid bill ID'),
];
