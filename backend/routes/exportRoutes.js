const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { param, query } = require('express-validator');
const { downloadBillsCSV } = require('../controllers/exportController');

const router = express.Router();

router.use(protect, restrictTo('owner'));

const messIdValidation = [
  param('messId').isMongoId().withMessage('Invalid mess ID'),
];

// GET /api/owner/messes/:messId/export/bills
router.get(
  '/messes/:messId/export/bills',
  [
    ...messIdValidation,
    query('year').optional().isInt({ min: 2020, max: 2100 }),
    query('month').optional().isInt({ min: 1, max: 12 }),
    query('paymentStatus').optional().isIn(['pending', 'paid', 'partially_paid', 'overdue']),
  ],
  validate,
  downloadBillsCSV
);

module.exports = router;
