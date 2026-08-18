const cron = require('node-cron');
const mongoose = require('mongoose');
const MessListing = require('../models/MessListing');
const Attendance = require('../models/Attendance');
const sendAttendanceReminder = require('../utils/sendAttendanceReminder');

// Run everyday at 8:00 PM
const scheduleAttendanceReminder = () => {
  cron.schedule('0 20 * * *', async () => {
    console.log('[CRON] Running attendance reminder job...');
    
    try {
      // 1. Get all active messes
      const activeMesses = await MessListing.find({ isActive: true }).populate('ownerId');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + 1);

      let reminderCount = 0;

      for (const mess of activeMesses) {
        if (!mess.ownerId || !mess.ownerId.email) continue;

        // 2. Check if attendance was marked for this mess today
        // We look for any attendance record created/updated today for a booking in this mess
        const attendanceExists = await Attendance.findOne({
          messId: mess._id, // Note: Attendance schema has bookingId, need to check if messId exists.
          // Wait, the Attendance schema doesn't have messId directly! 
          // We need to look up bookings for this mess, then check attendance for those bookings.
        });

        // Let's do a more accurate check.
        const Booking = require('../models/Booking');
        const activeBookings = await Booking.find({ messId: mess._id, status: 'confirmed' });
        
        if (activeBookings.length === 0) continue; // No students, no need to remind

        const bookingIds = activeBookings.map(b => b._id);

        const markedToday = await Attendance.findOne({
          bookingId: { $in: bookingIds },
          date: { $gte: today, $lt: nextDay }
        });

        // 3. If no attendance marked, send reminder
        if (!markedToday) {
          await sendAttendanceReminder(
            mess.ownerId.email,
            mess.ownerId.name,
            mess.name,
            mess._id
          );
          reminderCount++;
        }
      }

      console.log(`[CRON] Attendance reminder job completed. Sent ${reminderCount} reminders.`);
    } catch (error) {
      console.error('[CRON] Error running attendance reminder job:', error);
    }
  });
};

module.exports = scheduleAttendanceReminder;
