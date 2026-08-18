const catchAsync = require('../utils/catchAsync');
const { generateBillPDF } = require('../utils/generateBillPDF');
const {
  updateMealPricing,
  getMealPricing,
  generateBill,
  getMessBills,
  getBillById,
  updatePaymentStatus,
  getBillableBookings,
} = require('../services/billingService');

// @desc    Get meal pricing for a mess
// @route   GET /api/owner/messes/:messId/pricing
// @access  Owner only
exports.getMealPricing = catchAsync(async (req, res) => {
  const pricing = await getMealPricing(req.params.messId, req.user._id);

  res.status(200).json({
    success: true,
    data: pricing,
  });
});

// @desc    Update meal pricing for a mess
// @route   PUT /api/owner/messes/:messId/pricing
// @access  Owner only
exports.updateMealPricing = catchAsync(async (req, res) => {
  const updated = await updateMealPricing(req.params.messId, req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Meal pricing updated successfully',
    data: updated,
  });
});

// @desc    Get bookings eligible for billing in a given month
// @route   GET /api/owner/messes/:messId/billing/billable?year=2026&month=8
// @access  Owner only
exports.getBillableBookings = catchAsync(async (req, res) => {
  const { year, month } = req.query;

  const result = await getBillableBookings(
    req.params.messId,
    req.user._id,
    parseInt(year, 10),
    parseInt(month, 10)
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

// @desc    Generate a monthly bill for a booking
// @route   POST /api/owner/messes/:messId/billing/generate
// @access  Owner only
exports.generateBill = catchAsync(async (req, res) => {
  const { bookingId, year, month, discount, deposit, registrationFee, notes, dueDate } = req.body;

  const bill = await generateBill(
    req.params.messId,
    req.user._id,
    bookingId,
    parseInt(year, 10),
    parseInt(month, 10),
    { discount, deposit, registrationFee, notes, dueDate }
  );

  res.status(201).json({
    success: true,
    message: `Bill ${bill.billNumber} generated successfully`,
    data: bill,
  });
});

// @desc    Get all bills for a mess
// @route   GET /api/owner/messes/:messId/billing?year=&month=&paymentStatus=
// @access  Owner only
exports.getMessBills = catchAsync(async (req, res) => {
  const bills = await getMessBills(req.params.messId, req.user._id, req.query);

  res.status(200).json({
    success: true,
    results: bills.length,
    data: { bills },
  });
});

// @desc    Get a single bill by ID
// @route   GET /api/owner/billing/:billId
// @access  Owner only
exports.getBillById = catchAsync(async (req, res) => {
  const bill = await getBillById(req.params.billId, req.user._id);

  res.status(200).json({
    success: true,
    data: bill,
  });
});

// @desc    Update payment status on a bill
// @route   PATCH /api/owner/billing/:billId/payment
// @access  Owner only
exports.updatePaymentStatus = catchAsync(async (req, res) => {
  const bill = await updatePaymentStatus(req.params.billId, req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Payment status updated',
    data: bill,
  });
});

// @desc    Download a bill as PDF
// @route   GET /api/owner/billing/:billId/pdf
// @access  Owner only
exports.downloadBillPDF = catchAsync(async (req, res) => {
  const bill = await getBillById(req.params.billId, req.user._id);

  const pdfBuffer = await generateBillPDF(
    bill,
    {
      name: bill.studentId.name,
      email: bill.studentId.email,
      phone: bill.studentId.phone,
    },
    {
      name: bill.messId.name,
      address: bill.messId.address,
      city: bill.messId.city,
    }
  );

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${bill.billNumber}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });

  res.send(pdfBuffer);
});
