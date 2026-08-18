const catchAsync = require('../utils/catchAsync');
const { generateBillPDF } = require('../utils/generateBillPDF');
const { getMyBills, getMyBillById } = require('../services/studentBillingService');

// @desc    Get all bills for the logged-in student
// @route   GET /api/student/billing?year=&month=&paymentStatus=
// @access  Student only
exports.getMyBills = catchAsync(async (req, res) => {
  const bills = await getMyBills(req.user._id, req.query);

  res.status(200).json({
    success: true,
    results: bills.length,
    data: { bills },
  });
});

// @desc    Get a single bill by ID
// @route   GET /api/student/billing/:billId
// @access  Student only
exports.getMyBillById = catchAsync(async (req, res) => {
  const bill = await getMyBillById(req.params.billId, req.user._id);

  res.status(200).json({
    success: true,
    data: bill,
  });
});

// @desc    Download a bill as PDF
// @route   GET /api/student/billing/:billId/pdf
// @access  Student only
exports.downloadMyBillPDF = catchAsync(async (req, res) => {
  const bill = await getMyBillById(req.params.billId, req.user._id);

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
