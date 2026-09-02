const Bill = require('../models/Bill');
const AppError = require('../utils/AppError');

/**
 * Gets all bills for a specific student.
 * 
 * @param {string} studentId - The student's user ID
 * @param {Object} filters - Optional filters (year, month, paymentStatus)
 */
const getMyBills = async (studentId, filters = {}) => {
  const Booking = require('../models/Booking');
  const { syncStudentBill } = require('./studentAttendanceService');

  // Auto-sync bills for confirmed bookings so students immediately see active/completed month invoices
  const activeBookings = await Booking.find({ studentId, status: 'confirmed' }).populate('messId');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }

  for (const booking of activeBookings) {
    if (booking.messId) {
      await syncStudentBill(booking, prevYear, prevMonth);
      await syncStudentBill(booking, currentYear, currentMonth);
    }
  }

  const query = { studentId };

  if (filters.year) query['billingPeriod.year'] = parseInt(filters.year, 10);
  if (filters.month) query['billingPeriod.month'] = parseInt(filters.month, 10);
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;

  const bills = await Bill.find(query)
    .populate('messId', 'name address city')
    .sort({ 'billingPeriod.year': -1, 'billingPeriod.month': -1, createdAt: -1 });

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
