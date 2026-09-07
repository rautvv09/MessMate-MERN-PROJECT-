const cron = require('node-cron');
const User = require('../models/User');
const MessListing = require('../models/MessListing');
const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');
const Bill = require('../models/Bill');
const Notification = require('../models/Notification');
const { generateBill } = require('../services/billingService');

/**
 * Generates monthly bills for all active confirmed subscriptions across all messes.
 *
 * @param {number} targetYear - Billing year (e.g. 2026)
 * @param {number} targetMonth - Billing month (1-12)
 */
const generateAllMonthlyBills = async (targetYear, targetMonth) => {
  console.log(`[MONTHLY BILLING CRON] Starting bill generation for period ${targetYear}/${targetMonth}...`);

  try {
    // 1. Auto-expire any completed subscriptions past their end date
    await Booking.updateMany(
      {
        status: 'confirmed',
        endDate: { $lt: new Date() },
      },
      { $set: { status: 'completed' } }
    );

    // 2. Fetch all active confirmed subscriptions
    const activeBookings = await Booking.find({ status: 'confirmed' }).populate('messId');

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const booking of activeBookings) {
      if (!booking.messId) continue;
      const mess = booking.messId;

      try {
        await generateBill(
          mess._id,
          mess.ownerId,
          booking._id,
          targetYear,
          targetMonth
        );
        successCount++;
      } catch (err) {
        if (err.statusCode === 409 || err.message.includes('already exists')) {
          skippedCount++;
        } else {
          errorCount++;
          console.error(`[MONTHLY BILLING ERROR] Booking ${booking._id}:`, err.message);
        }
      }
    }

    console.log(
      `[MONTHLY BILLING CRON] Summary for ${targetYear}/${targetMonth}: Generated ${successCount} bill(s), Skipped ${skippedCount} existing, Errors ${errorCount}`
    );
    return { successCount, skippedCount, errorCount };
  } catch (error) {
    console.error('[MONTHLY BILLING CRON] Fatal error during automated billing:', error);
    throw error;
  }
};

/**
 * Marks all pending bills past their due date as 'overdue'.
 * Runs daily at midnight.
 */
const markOverdueBills = async () => {
  try {
    const result = await Bill.updateMany(
      {
        paymentStatus: 'pending',
        dueDate: { $lt: new Date() },
      },
      { $set: { paymentStatus: 'overdue' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`[OVERDUE CRON] Marked ${result.modifiedCount} bill(s) as overdue.`);
    }
  } catch (error) {
    console.error('[OVERDUE CRON] Error marking overdue bills:', error);
  }
};

/**
 * Schedules the automated monthly billing cron job.
 * 1. Runs at 23:55 PM on month-end days (28th-31st) when tomorrow is the 1st.
 * 2. Runs at 00:05 AM on the 1st of every month for the month that just ended.
 * 3. Runs daily at midnight to mark overdue bills.
 */
const scheduleMonthlyBilling = () => {
  // 1. Month-end check at 23:55 PM
  cron.schedule('55 23 28-31 * *', async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // If tomorrow is the 1st of next month, today is month-end!
    if (tomorrow.getDate() === 1) {
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      console.log(`[CRON] Month-end detected on ${today.toDateString()}. Generating bills for ${year}/${month}...`);
      await generateAllMonthlyBills(year, month);
    }
  });

  // 2. Backup check at 00:05 AM on 1st of every month
  cron.schedule('5 0 1 * *', async () => {
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = prevMonthDate.getFullYear();
    const month = prevMonthDate.getMonth() + 1;

    console.log(`[CRON] 1st-of-month backup billing running for ${year}/${month}...`);
    await generateAllMonthlyBills(year, month);
  });

  // 3. Daily overdue check at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily overdue bill check...');
    await markOverdueBills();
  });
};

module.exports = { scheduleMonthlyBilling, generateAllMonthlyBills, markOverdueBills };
