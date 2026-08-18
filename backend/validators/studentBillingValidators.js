const { param, query } = require('express-validator');

exports.getMyBillsQueryValidation = [
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

exports.billIdValidation = [
  param('billId').isMongoId().withMessage('Invalid bill ID'),
];
