const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getMyBillsQueryValidation,
  billIdValidation,
} = require('../validators/studentBillingValidators');
const {
  getMyBills,
  getMyBillById,
  downloadMyBillPDF,
} = require('../controllers/studentBillingController');

const router = express.Router();

// All routes below require an authenticated student
router.use(protect, restrictTo('student'));

// GET /api/student/billing
// Returns all bills for the student
router.get('/', getMyBillsQueryValidation, validate, getMyBills);

// GET /api/student/billing/:billId
// Returns a single bill
router.get('/:billId', billIdValidation, validate, getMyBillById);

// GET /api/student/billing/:billId/pdf
// Returns the bill as a PDF
router.get('/:billId/pdf', billIdValidation, validate, downloadMyBillPDF);

module.exports = router;
