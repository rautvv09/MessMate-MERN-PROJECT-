const mongoose = require('mongoose');
const MessListing = require('../models/MessListing');
const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');
const Bill = require('../models/Bill');
const AppError = require('../utils/AppError');

/**
 * Gets detailed revenue analytics for a mess over the last N months.
 * Aggregates data from the Bill model.
 */
const getRevenueAnalytics = async (messId, ownerId, months = 6) => {
  const mess = await MessListing.findOne({ _id: messId, ownerId });
  if (!mess) throw new AppError('Mess not found or not owned by you', 404);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months + 1);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const revenueData = await Bill.aggregate([
    {
      $match: {
        messId: mess._id,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          year: '$billingPeriod.year',
          month: '$billingPeriod.month',
        },
        totalBilled: { $sum: '$totalAmount' },
        totalCollected: { $sum: '$paidAmount' },
        pendingAmount: {
          $sum: {
            $cond: [
              { $ne: ['$paymentStatus', 'paid'] },
              { $subtract: ['$totalAmount', '$paidAmount'] },
              0
            ]
          }
        },
        billCount: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  // Format output to fill in empty months
  const formattedData = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-12

    const found = revenueData.find((r) => r._id.year === year && r._id.month === month);

    formattedData.push({
      year,
      month,
      monthName: d.toLocaleString('default', { month: 'short' }),
      totalBilled: found ? found.totalBilled : 0,
      totalCollected: found ? found.totalCollected : 0,
      pendingAmount: found ? found.pendingAmount : 0,
      billCount: found ? found.billCount : 0,
    });
  }

  return formattedData;
};

/**
 * Gets attendance trends for the last 30 days.
 * Shows average daily consumption for Breakfast, Lunch, and Dinner.
 */
const getAttendanceAnalytics = async (messId, ownerId) => {
  const mess = await MessListing.findOne({ _id: messId, ownerId });
  if (!mess) throw new AppError('Mess not found or not owned by you', 404);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);

  const attendanceData = await Attendance.aggregate([
    {
      $match: {
        messId: mess._id,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' },
        },
        dateStr: { $first: '$date' },
        breakfastCount: {
          $sum: { $cond: [{ $in: ['$breakfast.status', ['present', 'late']] }, 1, 0] },
        },
        lunchCount: {
          $sum: { $cond: [{ $in: ['$lunch.status', ['present', 'late']] }, 1, 0] },
        },
        dinnerCount: {
          $sum: { $cond: [{ $in: ['$dinner.status', ['present', 'late']] }, 1, 0] },
        },
        totalExpected: { $sum: 1 },
      },
    },
    {
      $sort: { dateStr: 1 },
    },
  ]);

  // Aggregate totals
  const totals = attendanceData.reduce(
    (acc, curr) => {
      acc.breakfast += curr.breakfastCount;
      acc.lunch += curr.lunchCount;
      acc.dinner += curr.dinnerCount;
      return acc;
    },
    { breakfast: 0, lunch: 0, dinner: 0 }
  );

  return {
    dailyTrends: attendanceData.map(d => ({
      date: d.dateStr.toISOString().split('T')[0],
      dayName: d.dateStr.toLocaleString('default', { weekday: 'short' }),
      breakfast: d.breakfastCount,
      lunch: d.lunchCount,
      dinner: d.dinnerCount,
      totalExpected: d.totalExpected
    })),
    mealDistribution: totals
  };
};

/**
 * Gets student retention and plan distribution stats.
 */
const getStudentAnalytics = async (messId, ownerId) => {
  const mess = await MessListing.findOne({ _id: messId, ownerId });
  if (!mess) throw new AppError('Mess not found or not owned by you', 404);

  // Plan Distribution
  const planDistribution = await Booking.aggregate([
    {
      $match: {
        messId: mess._id,
        status: 'confirmed',
      },
    },
    {
      $group: {
        _id: '$planType',
        count: { $sum: 1 },
      },
    },
  ]);

  // Active vs Cancelled vs Waitlisted
  const statusDistribution = await Booking.aggregate([
    {
      $match: {
        messId: mess._id,
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    planDistribution: planDistribution.map(p => ({
      name: p._id,
      value: p.count
    })),
    statusDistribution: statusDistribution.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {})
  };
};

module.exports = {
  getRevenueAnalytics,
  getAttendanceAnalytics,
  getStudentAnalytics,
};
