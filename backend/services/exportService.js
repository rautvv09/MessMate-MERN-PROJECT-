const { createObjectCsvStringifier } = require('csv-writer');
const Bill = require('../models/Bill');
const Attendance = require('../models/Attendance');
const MessListing = require('../models/MessListing');
const AppError = require('../utils/AppError');

/**
 * Export bills for a specific mess to CSV format.
 * 
 * @param {string} messId 
 * @param {string} ownerId 
 * @param {Object} filters - year, month, paymentStatus 
 * @returns {Promise<string>} CSV string
 */
const exportBillsToCSV = async (messId, ownerId, filters) => {
  // Verify ownership
  const mess = await MessListing.findOne({ _id: messId, ownerId });
  if (!mess) {
    throw new AppError('Mess not found or not owned by you', 404);
  }

  const query = { messId };
  if (filters.year) query['billingPeriod.year'] = parseInt(filters.year, 10);
  if (filters.month) query['billingPeriod.month'] = parseInt(filters.month, 10);
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;

  const bills = await Bill.find(query)
    .populate('studentId', 'name email phone')
    .sort({ createdAt: -1 });

  if (bills.length === 0) {
    throw new AppError('No bills found for the selected criteria', 404);
  }

  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'billNumber', title: 'Invoice Number' },
      { id: 'studentName', title: 'Student Name' },
      { id: 'studentEmail', title: 'Student Email' },
      { id: 'studentPhone', title: 'Student Phone' },
      { id: 'period', title: 'Billing Period' },
      { id: 'planType', title: 'Plan Type' },
      { id: 'totalDays', title: 'Total Attendance Days' },
      { id: 'totalMeals', title: 'Total Meals Consumed' },
      { id: 'subtotal', title: 'Subtotal (₹)' },
      { id: 'discount', title: 'Discount (₹)' },
      { id: 'gstAmount', title: 'GST Amount (₹)' },
      { id: 'totalAmount', title: 'Total Amount (₹)' },
      { id: 'paymentStatus', title: 'Payment Status' },
      { id: 'paidAmount', title: 'Paid Amount (₹)' },
      { id: 'paymentMethod', title: 'Payment Method' },
      { id: 'dueDate', title: 'Due Date' },
      { id: 'createdAt', title: 'Generated On' }
    ]
  });

  const records = bills.map(bill => ({
    billNumber: bill.billNumber,
    studentName: bill.studentId.name,
    studentEmail: bill.studentId.email,
    studentPhone: bill.studentId.phone || 'N/A',
    period: `${bill.billingPeriod.month}/${bill.billingPeriod.year}`,
    planType: bill.planType,
    totalDays: bill.mealCounts.totalDays,
    totalMeals: bill.mealCounts.totalMeals,
    subtotal: bill.subtotal.toFixed(2),
    discount: bill.discount.toFixed(2),
    gstAmount: bill.gstAmount.toFixed(2),
    totalAmount: bill.totalAmount.toFixed(2),
    paymentStatus: bill.paymentStatus.toUpperCase(),
    paidAmount: bill.paidAmount.toFixed(2),
    paymentMethod: bill.paymentMethod ? bill.paymentMethod.toUpperCase() : 'N/A',
    dueDate: new Date(bill.dueDate).toLocaleDateString(),
    createdAt: new Date(bill.createdAt).toLocaleDateString()
  }));

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
};

module.exports = {
  exportBillsToCSV,
};
