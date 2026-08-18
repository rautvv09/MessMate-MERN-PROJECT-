const catchAsync = require('../utils/catchAsync');
const { exportBillsToCSV } = require('../services/exportService');

// @desc    Export bills to CSV
// @route   GET /api/owner/messes/:messId/export/bills
// @access  Owner only
exports.downloadBillsCSV = catchAsync(async (req, res) => {
  const { messId } = req.params;
  const filters = {
    year: req.query.year,
    month: req.query.month,
    paymentStatus: req.query.paymentStatus,
  };

  const csvString = await exportBillsToCSV(messId, req.user._id, filters);

  const filename = `bills_export_${messId}_${Date.now()}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  res.status(200).send(csvString);
});
