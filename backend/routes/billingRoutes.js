const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  updatePricingValidation,
  billableQueryValidation,
  generateBillValidation,
  getBillsQueryValidation,
  updatePaymentValidation,
  billIdValidation,
} = require('../validators/billingValidators');
const {
  getMealPricing,
  updateMealPricing,
  getBillableBookings,
  generateBill,
  getMessBills,
  getBillById,
  updatePaymentStatus,
  downloadBillPDF,
} = require('../controllers/billingController');

const router = express.Router();

// All billing routes require an authenticated owner
router.use(protect, restrictTo('owner'));

// ==================== MEAL PRICING ====================

// GET  /api/owner/messes/:messId/pricing
router.get('/messes/:messId/pricing', getMealPricing);

// PUT  /api/owner/messes/:messId/pricing
router.put(
  '/messes/:messId/pricing',
  updatePricingValidation,
  validate,
  updateMealPricing
);

// ==================== BILL GENERATION ====================

// GET  /api/owner/messes/:messId/billing/billable?year=&month=
router.get(
  '/messes/:messId/billing/billable',
  billableQueryValidation,
  validate,
  getBillableBookings
);

// POST /api/owner/messes/:messId/billing/generate
router.post(
  '/messes/:messId/billing/generate',
  generateBillValidation,
  validate,
  generateBill
);

// ==================== BILL MANAGEMENT ====================

// GET  /api/owner/messes/:messId/billing?year=&month=&paymentStatus=
router.get(
  '/messes/:messId/billing',
  getBillsQueryValidation,
  validate,
  getMessBills
);

// GET  /api/owner/billing/:billId
router.get(
  '/billing/:billId',
  billIdValidation,
  validate,
  getBillById
);

// PATCH /api/owner/billing/:billId/payment
router.patch(
  '/billing/:billId/payment',
  updatePaymentValidation,
  validate,
  updatePaymentStatus
);

// GET   /api/owner/billing/:billId/pdf
router.get(
  '/billing/:billId/pdf',
  billIdValidation,
  validate,
  downloadBillPDF
);

module.exports = router;
