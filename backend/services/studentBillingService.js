const Bill = require('../models/Bill');
const AppError = require('../utils/AppError');

/**
 * Gets all bills for a specific student.
 * 
 * @param {string} studentId - The student's user ID
 * @param {Object} filters - Optional filters (year, month, paymentStatus)
 */
const getMyBills = async (studentId, filters = {}) => {
  const query = { studentId };

  if (filters.year) query['billingPeriod.year'] = parseInt(filters.year, 10);
  if (filters.month) query['billingPeriod.month'] = parseInt(filters.month, 10);
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;

  const bills = await Bill.find(query)
    .populate('messId', 'name address city')
    .sort({ createdAt: -1 });

  return bills;
};

/**
 * Gets a single bill by ID, ensuring it belongs to the student.
 * 
 * @param {string} billId - The bill ID
 * @param {string} studentId - The student's user ID
 */
const getMyBillById = async (billId, studentId) => {
  const bill = await Bill.findOne({ _id: billId, studentId })
    .populate('messId', 'name address city')
    .populate('studentId', 'name email phone');

  if (!bill) {
    throw new AppError('Bill not found or you do not have permission to view it', 404);
  }

  return bill;
};

module.exports = {
  getMyBills,
  getMyBillById,
};
