const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');

/**
 * Get the list of active (confirmed) bookings for a student.
 * Each booking represents a mess the student is enrolled in.
 * Used by the frontend to let the student pick which mess to view.
 */
const getStudentBookings = async (studentId) => {
  const bookings = await Booking.find({
    studentId,
    status: 'confirmed',
  })
    .populate('messId', 'name city address')
    .sort({ createdAt: -1 });

  return bookings.map((booking) => ({
    bookingId: booking._id,
    messId: booking.messId._id,
    messName: booking.messId.name,
    messCity: booking.messId.city,
    planType: booking.planType,
    joiningDate: booking.joiningDate,
  }));
};

/**
 * Get monthly attendance statistics for a student at a specific mess.
 * Uses the Attendance model's getStudentStats aggregation pipeline.
 *
 * @param {string} studentId - The student's user ID
 * @param {string} bookingId - The booking ID (scopes to a specific mess)
 * @param {number} year      - Calendar year (e.g. 2026)
 * @param {number} month     - Calendar month (1-12)
 */
const getMonthlyStats = async (studentId, bookingId, year, month) => {
  // Validate the booking belongs to this student
  const booking = await Booking.findOne({
    _id: bookingId,
    studentId,
  }).populate('messId');

  if (!booking) {
    throw new AppError('Booking not found or does not belong to you', 404);
  }

  // Build the date range for the requested month
  const startDate = new Date(year, month - 1, 1); // First day of month
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(year, month, 0); // Last day of month
  endDate.setHours(23, 59, 59, 999);

  const stats = await Attendance.getStudentStats(studentId, startDate, endDate);

  const Bill = require('../models/Bill');
  let currentBill = await Bill.findOne({
    studentId,
    bookingId,
    'billingPeriod.year': year,
    'billingPeriod.month': month,
  });

  let currentBillAmount = 0;
  if (currentBill) {
    currentBillAmount = currentBill.totalAmount;
  } else {
    // If no bill document exists yet for an ongoing month, calculate live from attendance
    const messPricing = booking.messId?.mealPricing;
    const bPrice = messPricing?.breakfast || 40;
    const lPrice = messPricing?.lunch || 80;
    const dPrice = messPricing?.dinner || 80;
    const subtotal = (stats.breakfastTaken * bPrice) + (stats.lunchTaken * lPrice) + (stats.dinnerTaken * dPrice);
    const gstPct = messPricing?.gstPercentage || 0;
    currentBillAmount = Math.round((subtotal + (subtotal * gstPct) / 100) * 100) / 100;
  }

  return {
    year,
    month,
    messName: booking.messId?.name,
    bookingId,
    planType: booking.planType,
    currentBillAmount,
    billStatus: currentBill?.paymentStatus || 'Ongoing',
    ...stats,
  };
};

/**
 * Get the daily attendance calendar data for a student in a given month.
 * Returns an array of attendance records (one per day) for rendering
 * a color-coded calendar grid.
 *
 * @param {string} studentId - The student's user ID
 * @param {string} bookingId - The booking ID
 * @param {number} year      - Calendar year
 * @param {number} month     - Calendar month (1-12)
 */
const getMonthlyCalendar = async (studentId, bookingId, year, month) => {
  // Validate the booking belongs to this student
  const booking = await Booking.findOne({
    _id: bookingId,
    studentId,
  });

  if (!booking) {
    throw new AppError('Booking not found or does not belong to you', 404);
  }

  const startDate = new Date(year, month - 1, 1);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(year, month, 0);
  endDate.setHours(23, 59, 59, 999);

  const records = await Attendance.find({
    studentId: new mongoose.Types.ObjectId(studentId),
    bookingId: new mongoose.Types.ObjectId(bookingId),
    date: { $gte: startDate, $lte: endDate },
  })
    .sort({ date: 1 })
    .select('date breakfast lunch dinner lockedForBilling notes')
    .lean();

  // Transform into a simpler shape for the frontend calendar
  return records.map((record) => ({
    date: record.date,
    day: new Date(record.date).getDate(),
    breakfast: record.breakfast.status,
    lunch: record.lunch.status,
    dinner: record.dinner.status,
    lockedForBilling: record.lockedForBilling,
    notes: record.notes || '',
  }));
};

/**
 * Get attendance history for a student with pagination.
 * Returns the most recent attendance records across all bookings.
 *
 * @param {string} studentId - The student's user ID
 * @param {number} page      - Page number (1-based)
 * @param {number} limit     - Records per page
 */
const getAttendanceHistory = async (studentId, page = 1, limit = 30) => {
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Attendance.find({ studentId: new mongoose.Types.ObjectId(studentId) })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('messId', 'name')
      .select('date breakfast lunch dinner messId lockedForBilling notes')
      .lean(),
    Attendance.countDocuments({ studentId: new mongoose.Types.ObjectId(studentId) }),
  ]);

  const history = records.map((record) => ({
    date: record.date,
    messName: record.messId?.name || 'Unknown',
    breakfast: record.breakfast.status,
    lunch: record.lunch.status,
    dinner: record.dinner.status,
    lockedForBilling: record.lockedForBilling,
    notes: record.notes || '',
  }));

  return {
    records: history,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Mark daily attendance for a student and auto-sync the monthly bill.
 */
const markStudentAttendance = async (studentId, { bookingId, date, status, breakfast, lunch, dinner, notes }) => {
  const booking = await Booking.findOne({ _id: bookingId, studentId }).populate('messId');
  if (!booking) {
    throw new AppError('Booking not found or does not belong to you', 404);
  }

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (targetDate > today) {
    throw new AppError('Attendance cannot be marked for a future date', 400);
  }

  let existing = await Attendance.findOne({
    studentId,
    messId: booking.messId._id,
    date: targetDate,
  });

  if (existing && existing.lockedForBilling) {
    throw new AppError('Cannot modify attendance after bill has been generated', 403);
  }

  const mealStatus = status === 'present' ? 'present' : status === 'absent' ? 'absent' : null;
  const bStatus = breakfast || mealStatus || 'absent';
  const lStatus = lunch || mealStatus || 'absent';
  const dStatus = dinner || mealStatus || 'absent';

  const updateData = {
    bookingId: booking._id,
    breakfast: { status: bStatus, markedAt: new Date() },
    lunch: { status: lStatus, markedAt: new Date() },
    dinner: { status: dStatus, markedAt: new Date() },
    markedBy: studentId,
    notes: notes || '',
  };

  const record = await Attendance.findOneAndUpdate(
    { studentId, messId: booking.messId._id, date: targetDate },
    { $set: updateData, $setOnInsert: { lockedForBilling: false } },
    { upsert: true, new: true, runValidators: true }
  );

  // Auto-calculate / Sync Monthly Bill for this student so Owner can see it!
  await syncStudentBill(booking, targetDate.getFullYear(), targetDate.getMonth() + 1);

  return record;
};

/**
 * Helper to sync or create monthly bill for student so owner section reflects it immediately
 */
const syncStudentBill = async (booking, year, month) => {
  try {
    const Bill = require('../models/Bill');
    const mess = booking.messId;
    if (!mess) return;

    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const mealCounts = await Attendance.getBillingMealCounts(booking._id, startDate, endDate);

    const priceSnapshot = {
      breakfastPrice: mess.mealPricing?.breakfast || 40,
      lunchPrice: mess.mealPricing?.lunch || 80,
      dinnerPrice: mess.mealPricing?.dinner || 80,
      gstPercentage: mess.mealPricing?.gstPercentage || 0,
    };

    const breakfastTotal = mealCounts.breakfastCount * priceSnapshot.breakfastPrice;
    const lunchTotal = mealCounts.lunchCount * priceSnapshot.lunchPrice;
    const dinnerTotal = mealCounts.dinnerCount * priceSnapshot.dinnerPrice;
    const mealSubtotal = breakfastTotal + lunchTotal + dinnerTotal;
    const subtotal = mealSubtotal;
    const taxableAmount = subtotal;
    const gstAmount = Math.round((taxableAmount * priceSnapshot.gstPercentage) / 100 * 100) / 100;
    const totalAmount = Math.round((taxableAmount + gstAmount) * 100) / 100;

    const dueDate = new Date(year, month, 10);

    let bill = await Bill.findOne({
      bookingId: booking._id,
      'billingPeriod.year': year,
      'billingPeriod.month': month,
    });

    if (bill) {
      bill.mealCounts = mealCounts;
      bill.breakfastTotal = breakfastTotal;
      bill.lunchTotal = lunchTotal;
      bill.dinnerTotal = dinnerTotal;
      bill.mealSubtotal = mealSubtotal;
      bill.subtotal = subtotal;
      bill.taxableAmount = taxableAmount;
      bill.gstAmount = gstAmount;
      bill.totalAmount = totalAmount;
      await bill.save();
    } else {
      await Bill.create({
        studentId: booking.studentId,
        bookingId: booking._id,
        messId: mess._id,
        generatedBy: mess.ownerId,
        billingPeriod: { year, month, startDate, endDate },
        mealCounts,
        priceSnapshot,
        breakfastTotal,
        lunchTotal,
        dinnerTotal,
        mealSubtotal,
        subtotal,
        taxableAmount,
        gstAmount,
        totalAmount,
        dueDate,
        planType: booking.planType,
        paymentStatus: 'pending',
      });
    }
  } catch (err) {
    console.error('Error auto-syncing student bill:', err.message);
  }
};

module.exports = {
  getStudentBookings,
  getMonthlyStats,
  getMonthlyCalendar,
  getAttendanceHistory,
  markStudentAttendance,
};
