const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');
const MessListing = require('../models/MessListing');
const AppError = require('../utils/AppError');

/**
 * Updates the meal pricing for a mess.
 *
 * @param {string} messId  - The mess ID
 * @param {string} ownerId - The owner's user ID
 * @param {Object} pricing - { breakfast, lunch, dinner, fullDay, gstPercentage }
 */
const updateMealPricing = async (messId, ownerId, pricing) => {
  const mess = await MessListing.findOne({ _id: messId, ownerId });
  if (!mess) {
    throw new AppError('Mess not found or not owned by you', 404);
  }

  mess.mealPricing = {
    breakfast: pricing.breakfast ?? mess.mealPricing.breakfast,
    lunch: pricing.lunch ?? mess.mealPricing.lunch,
    dinner: pricing.dinner ?? mess.mealPricing.dinner,
    fullDay: pricing.fullDay ?? mess.mealPricing.fullDay,
    gstPercentage: pricing.gstPercentage ?? mess.mealPricing.gstPercentage,
  };

  await mess.save();
  return mess.mealPricing;
};

/**
 * Gets the current meal pricing for a mess.
 */
const getMealPricing = async (messId, ownerId) => {
  const mess = await MessListing.findOne({ _id: messId, ownerId });
  if (!mess) {
    throw new AppError('Mess not found or not owned by you', 404);
  }

  return {
    messId: mess._id,
    messName: mess.name,
    mealPricing: mess.mealPricing,
  };
};

/**
 * Generates a monthly bill for a specific booking.
 *
 * Steps:
 * 1. Validate mess ownership and booking
 * 2. Check no bill already exists for this month
 * 3. Get meal counts from attendance aggregation
 * 4. Snapshot current meal prices
 * 5. Calculate bill using the formula
 * 6. Create the Bill document
 * 7. Lock attendance records (lockedForBilling = true)
 *
 * @param {string} messId    - The mess ID
 * @param {string} ownerId   - The owner's user ID
 * @param {string} bookingId - The booking ID
 * @param {number} year      - Billing year
 * @param {number} month     - Billing month (1-12)
 * @param {Object} extras    - { discount, deposit, registrationFee, notes, dueDate }
 */
const generateBill = async (messId, ownerId, bookingId, year, month, extras = {}) => {
  // Step 1: Validate mess ownership
  const mess = await MessListing.findOne({ _id: messId, ownerId });
  if (!mess) {
    throw new AppError('Mess not found or not owned by you', 404);
  }

  // Step 2: Validate the booking
  const booking = await Booking.findOne({
    _id: bookingId,
    messId: mess._id,
  }).populate('studentId', 'name email phone');

  if (!booking) {
    throw new AppError('Booking not found at this mess', 404);
  }

  // Step 3: Check for existing bill
  const existingBill = await Bill.findOne({
    bookingId,
    'billingPeriod.year': year,
    'billingPeriod.month': month,
  });

  if (existingBill) {
    throw new AppError(
      `Bill already exists for ${year}/${month}: ${existingBill.billNumber}`,
      409
    );
  }

  // Step 4: Build date range for the billing period
  const startDate = new Date(year, month - 1, 1);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(year, month, 0);
  endDate.setHours(23, 59, 59, 999);

  // Step 5: Get meal counts from attendance
  const mealCounts = await Attendance.getBillingMealCounts(bookingId, startDate, endDate);

  // Step 6: Snapshot current prices
  const priceSnapshot = {
    breakfastPrice: mess.mealPricing.breakfast,
    lunchPrice: mess.mealPricing.lunch,
    dinnerPrice: mess.mealPricing.dinner,
    gstPercentage: mess.mealPricing.gstPercentage,
  };

  // Step 7: Calculate the bill
  const breakfastTotal = mealCounts.breakfastCount * priceSnapshot.breakfastPrice;
  const lunchTotal = mealCounts.lunchCount * priceSnapshot.lunchPrice;
  const dinnerTotal = mealCounts.dinnerCount * priceSnapshot.dinnerPrice;
  const mealSubtotal = breakfastTotal + lunchTotal + dinnerTotal;

  const deposit = extras.deposit ?? 0;
  const registrationFee = extras.registrationFee ?? 0;
  const subtotal = mealSubtotal + deposit + registrationFee;

  const discount = extras.discount ?? 0;
  const taxableAmount = Math.max(subtotal - discount, 0);

  const gstAmount = Math.round((taxableAmount * priceSnapshot.gstPercentage) / 100 * 100) / 100;
  const totalAmount = Math.round((taxableAmount + gstAmount) * 100) / 100;

  // Step 8: Set due date (default: 10th of next month)
  const dueDate = extras.dueDate
    ? new Date(extras.dueDate)
    : new Date(year, month, 10); // 10th of the following month

  // Step 9: Create the bill
  const bill = await Bill.create({
    studentId: booking.studentId._id,
    bookingId: booking._id,
    messId: mess._id,
    generatedBy: ownerId,

    billingPeriod: {
      year,
      month,
      startDate,
      endDate,
    },

    mealCounts,
    priceSnapshot,

    breakfastTotal,
    lunchTotal,
    dinnerTotal,
    mealSubtotal,

    deposit,
    registrationFee,
    subtotal,
    discount,
    taxableAmount,
    gstAmount,
    totalAmount,

    dueDate,
    planType: booking.planType,
    notes: extras.notes || '',
  });

  // Step 10: Lock attendance records for this billing period
  await Attendance.updateMany(
    {
      bookingId: new mongoose.Types.ObjectId(bookingId),
      date: { $gte: startDate, $lte: endDate },
    },
    { $set: { lockedForBilling: true } }
  );

  // Step 11: Send email notification to the student
  try {
    const sendBillNotification = require('../utils/sendBillNotification');
    await sendBillNotification(
      booking.studentId.email,
      booking.studentId.name,
      mess.name,
      bill.billNumber,
      bill.totalAmount,
      bill.dueDate
    );
  } catch (emailError) {
    console.error('Failed to send bill notification email:', emailError);
    // Don't throw error here, as the bill was successfully generated
  }

  return bill;
};

/**
 * Gets all bills for a specific mess.
 */
const getMessBills = async (messId, ownerId, filters = {}) => {
  const mess = await MessListing.findOne({ _id: messId, ownerId });
  if (!mess) {
    throw new AppError('Mess not found or not owned by you', 404);
  }

  const query = { messId: mess._id };

  if (filters.year) query['billingPeriod.year'] = parseInt(filters.year, 10);
  if (filters.month) query['billingPeriod.month'] = parseInt(filters.month, 10);
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;

  const bills = await Bill.find(query)
    .populate('studentId', 'name email phone')
    .populate('bookingId', 'bookingId planType')
    .sort({ createdAt: -1 });

  return bills;
};

/**
 * Gets a single bill by ID (owner access).
 */
const getBillById = async (billId, ownerId) => {
  const bill = await Bill.findById(billId)
    .populate('studentId', 'name email phone avatarUrl')
    .populate('bookingId', 'bookingId planType')
    .populate('messId', 'name address city');

  if (!bill) {
    throw new AppError('Bill not found', 404);
  }

  // Verify ownership
  const mess = await MessListing.findOne({ _id: bill.messId._id, ownerId });
  if (!mess) {
    throw new AppError('Not authorized to view this bill', 403);
  }

  return bill;
};

/**
 * Updates payment status on a bill.
 */
const updatePaymentStatus = async (billId, ownerId, paymentData) => {
  const bill = await Bill.findById(billId);
  if (!bill) {
    throw new AppError('Bill not found', 404);
  }

  // Verify ownership
  const mess = await MessListing.findOne({ _id: bill.messId, ownerId });
  if (!mess) {
    throw new AppError('Not authorized to update this bill', 403);
  }

  bill.paymentStatus = paymentData.status;
  bill.paidAmount = paymentData.paidAmount ?? bill.paidAmount;
  bill.paymentMethod = paymentData.paymentMethod ?? bill.paymentMethod;

  if (paymentData.status === 'paid') {
    bill.paidAt = new Date();
    bill.paidAmount = bill.totalAmount;
  }

  await bill.save();
  return bill;
};

/**
 * Gets all bookings eligible for billing in a given month.
 * Returns bookings that don't already have a bill for the specified period.
 */
const getBillableBookings = async (messId, ownerId, year, month) => {
  const mess = await MessListing.findOne({ _id: messId, ownerId });
  if (!mess) {
    throw new AppError('Mess not found or not owned by you', 404);
  }

  // Get confirmed bookings
  const bookings = await Booking.find({
    messId: mess._id,
    status: 'confirmed',
  }).populate('studentId', 'name email phone');

  // Get existing bills for this period
  const existingBills = await Bill.find({
    messId: mess._id,
    'billingPeriod.year': year,
    'billingPeriod.month': month,
  }).select('bookingId');

  const billedBookingIds = new Set(
    existingBills.map((b) => b.bookingId.toString())
  );

  // Filter to unbilled bookings only
  const billableBookings = bookings.filter(
    (b) => !billedBookingIds.has(b._id.toString())
  );

  return {
    billable: billableBookings,
    alreadyBilled: existingBills.length,
    total: bookings.length,
    mealPricing: mess.mealPricing,
  };
};

module.exports = {
  updateMealPricing,
  getMealPricing,
  generateBill,
  getMessBills,
  getBillById,
  updatePaymentStatus,
  getBillableBookings,
};
