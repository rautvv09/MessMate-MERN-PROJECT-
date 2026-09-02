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

  return bookings
    .filter((booking) => booking.messId != null)
    .map((booking) => ({
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
 */
const getMonthlyStats = async (studentId, bookingId, year, month) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    studentId,
  }).populate('messId');

  if (!booking) {
    throw new AppError('Booking not found or does not belong to you', 404);
  }

  const validYear = parseInt(year, 10) || new Date().getFullYear();
  const validMonth = parseInt(month, 10) || (new Date().getMonth() + 1);

  const calendarDays = await getMonthlyCalendar(studentId, bookingId, validYear, validMonth);

  const billableStatuses = ['present', 'late'];

  let totalDays = 0;
  let breakfastTaken = 0;
  let lunchTaken = 0;
  let dinnerTaken = 0;
  let breakfastMissed = 0;
  let lunchMissed = 0;
  let dinnerMissed = 0;
  let leaveDays = 0;
  let holidayDays = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  calendarDays.forEach((d) => {
    const dDate = new Date(d.date);
    dDate.setHours(0, 0, 0, 0);

    if (dDate <= today) {
      totalDays++;
      if (billableStatuses.includes(d.breakfast)) breakfastTaken++; else breakfastMissed++;
      if (billableStatuses.includes(d.lunch)) lunchTaken++; else lunchMissed++;
      if (billableStatuses.includes(d.dinner)) dinnerTaken++; else dinnerMissed++;

      if (d.breakfast === 'leave' && d.lunch === 'leave' && d.dinner === 'leave') leaveDays++;
      if (d.breakfast === 'holiday' && d.lunch === 'holiday' && d.dinner === 'holiday') holidayDays++;
    }
  });

  const totalMealsConsumed = breakfastTaken + lunchTaken + dinnerTaken;
  const totalMealsMissed = breakfastMissed + lunchMissed + dinnerMissed;
  const attendancePercentage = totalDays > 0 ? Math.round((totalMealsConsumed / (totalDays * 3)) * 1000) / 10 : 0;

  const stats = {
    totalDays,
    breakfastTaken,
    lunchTaken,
    dinnerTaken,
    breakfastMissed,
    lunchMissed,
    dinnerMissed,
    totalMealsConsumed,
    totalMealsMissed,
    leaveDays,
    holidayDays,
    attendancePercentage,
  };

  const Bill = require('../models/Bill');
  let currentBill = await Bill.findOne({
    studentId,
    bookingId,
    'billingPeriod.year': validYear,
    'billingPeriod.month': validMonth,
  });

  let currentBillAmount = 0;
  if (currentBill) {
    currentBillAmount = currentBill.totalAmount;
  } else {
    const messPricing = booking.messId?.mealPricing;
    const bPrice = messPricing?.breakfast || 40;
    const lPrice = messPricing?.lunch || 70;
    const dPrice = messPricing?.dinner || 70;
    const subtotal = (breakfastTaken * bPrice) + (lunchTaken * lPrice) + (dinnerTaken * dPrice);
    const gstPct = messPricing?.gstPercentage || 0;
    currentBillAmount = Math.round((subtotal + (subtotal * gstPct) / 100) * 100) / 100;
  }

  return {
    year: validYear,
    month: validMonth,
    messName: booking.messId?.name || 'Mess',
    bookingId,
    planType: booking.planType,
    currentBillAmount,
    billStatus: currentBill?.paymentStatus || 'Ongoing',
    ...stats,
  };
};

/**
 * Get the daily attendance calendar data for a student in a given month.
 * Automatically defaults past and current days (up to today) to 'present' if unrecorded.
 */
const getMonthlyCalendar = async (studentId, bookingId, year, month) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    studentId,
  });

  if (!booking) {
    throw new AppError('Booking not found or does not belong to you', 404);
  }

  const validYear = parseInt(year, 10) || new Date().getFullYear();
  const validMonth = parseInt(month, 10) || (new Date().getMonth() + 1);

  const startDate = new Date(validYear, validMonth - 1, 1);
  startDate.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(validYear, validMonth, 0).getDate();
  const endDate = new Date(validYear, validMonth, 0);
  endDate.setHours(23, 59, 59, 999);

  const existingRecords = await Attendance.find({
    studentId: new mongoose.Types.ObjectId(studentId),
    bookingId: new mongoose.Types.ObjectId(bookingId),
    date: { $gte: startDate, $lte: endDate },
  })
    .sort({ date: 1 })
    .select('date breakfast lunch dinner lockedForBilling notes')
    .lean();

  const recordMap = new Map();
  existingRecords.forEach((rec) => {
    const d = new Date(rec.date).getDate();
    recordMap.set(d, rec);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(validYear, validMonth - 1, day);
    dateObj.setHours(0, 0, 0, 0);

    const isPastOrToday = dateObj <= today;
    const existing = recordMap.get(day);

    if (existing) {
      days.push({
        date: existing.date,
        day,
        breakfast: existing.breakfast?.status || (isPastOrToday ? 'present' : 'absent'),
        lunch: existing.lunch?.status || (isPastOrToday ? 'present' : 'absent'),
        dinner: existing.dinner?.status || (isPastOrToday ? 'present' : 'absent'),
        lockedForBilling: existing.lockedForBilling || false,
        notes: existing.notes || '',
      });
    } else if (isPastOrToday) {
      // By default up to today, mark present!
      days.push({
        date: dateObj,
        day,
        breakfast: 'present',
        lunch: 'present',
        dinner: 'present',
        lockedForBilling: false,
        notes: '',
      });
    } else {
      // Future date
      days.push({
        date: dateObj,
        day,
        breakfast: 'absent',
        lunch: 'absent',
        dinner: 'absent',
        lockedForBilling: false,
        notes: '',
      });
    }
  }

  return days;
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
