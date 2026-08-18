const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');
const MessListing = require('../models/MessListing');
const AppError = require('../utils/AppError');

// ==================== HELPER: Plan-to-Applicable-Meals Map ====================
// A student's planType determines which meals they're enrolled for.
// Meals outside their plan are always marked 'absent' and are never billable.
const PLAN_MEALS = {
  'Full Day': ['breakfast', 'lunch', 'dinner'],
  'Lunch & Dinner': ['lunch', 'dinner'],
  'Lunch Only': ['lunch'],
  'Dinner Only': ['dinner'],
};

/**
 * Fetches the booked (confirmed) students for a specific mess,
 * along with any existing attendance records for the given date.
 *
 * This is the primary data source for the Owner Attendance Panel.
 * It returns everything the frontend needs to render the attendance table:
 * - Student info (name, email, phone, avatar)
 * - Booking details (planType, bookingId)
 * - Which meals are applicable for each student's plan
 * - Pre-filled attendance if it was already saved for that date
 */
const getAttendanceSheet = async (messId, ownerId, date) => {
  // Step 1: Verify the mess exists and belongs to this owner
  const mess = await MessListing.findOne({ _id: messId, ownerId });
  if (!mess) {
    throw new AppError('Mess not found or not owned by you', 404);
  }

  // Step 2: Get all confirmed bookings for this mess
  const bookings = await Booking.find({
    messId: mess._id,
    status: 'confirmed',
  })
    .populate('studentId', 'name email phone avatarUrl')
    .sort({ createdAt: 1 });

  if (bookings.length === 0) {
    return {
      mess: { _id: mess._id, name: mess.name },
      date,
      students: [],
      summary: { total: 0, marked: 0, unmarked: 0 },
    };
  }

  // Step 3: Normalize the date to midnight for consistent querying
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  // Step 4: Fetch existing attendance records for this mess + date in bulk
  // Using a Map for O(1) lookup by studentId when merging with bookings
  const existingRecords = await Attendance.find({
    messId: mess._id,
    date: normalizedDate,
  });

  const attendanceMap = new Map();
  for (const record of existingRecords) {
    attendanceMap.set(record.studentId.toString(), record);
  }

  // Step 5: Build the attendance sheet — one row per booked student
  const students = bookings.map((booking) => {
    const studentIdStr = booking.studentId._id.toString();
    const existingRecord = attendanceMap.get(studentIdStr);
    const applicableMeals = PLAN_MEALS[booking.planType] || [];

    return {
      studentId: booking.studentId._id,
      name: booking.studentId.name,
      email: booking.studentId.email,
      phone: booking.studentId.phone,
      avatarUrl: booking.studentId.avatarUrl,
      bookingId: booking._id,
      planType: booking.planType,
      applicableMeals,

      // Pre-fill with existing record, or default to 'absent' for applicable meals
      breakfast: existingRecord
        ? existingRecord.breakfast.status
        : applicableMeals.includes('breakfast')
          ? 'absent'
          : 'absent',
      lunch: existingRecord
        ? existingRecord.lunch.status
        : applicableMeals.includes('lunch')
          ? 'absent'
          : 'absent',
      dinner: existingRecord
        ? existingRecord.dinner.status
        : applicableMeals.includes('dinner')
          ? 'absent'
          : 'absent',
      notes: existingRecord ? existingRecord.notes : '',
      lockedForBilling: existingRecord ? existingRecord.lockedForBilling : false,
      isMarked: !!existingRecord,
    };
  });

  const markedCount = students.filter((s) => s.isMarked).length;

  return {
    mess: { _id: mess._id, name: mess.name },
    date: normalizedDate,
    students,
    summary: {
      total: students.length,
      marked: markedCount,
      unmarked: students.length - markedCount,
    },
  };
};

/**
 * Saves attendance for all students in a single bulk write.
 * Uses the Attendance model's bulkUpsertAttendance static method
 * for a single round-trip to MongoDB.
 *
 * Validates:
 * - Mess ownership
 * - Each studentId has a confirmed booking at this mess
 * - No locked (billed) records are being overwritten
 */
const saveAttendance = async (messId, ownerId, date, records) => {
  // Step 1: Verify mess ownership
  const mess = await MessListing.findOne({ _id: messId, ownerId });
  if (!mess) {
    throw new AppError('Mess not found or not owned by you', 404);
  }

  // Step 2: Normalize date
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  // Step 3: Validate all student-booking pairs in one query
  const bookingIds = records.map((r) => r.bookingId);
  const studentIds = records.map((r) => r.studentId);

  const validBookings = await Booking.find({
    _id: { $in: bookingIds },
    studentId: { $in: studentIds },
    messId: mess._id,
    status: 'confirmed',
  });

  // Build a set of valid "studentId:bookingId" pairs for O(1) validation
  const validPairs = new Set(
    validBookings.map((b) => `${b.studentId.toString()}:${b._id.toString()}`)
  );

  const invalidRecords = records.filter(
    (r) => !validPairs.has(`${r.studentId}:${r.bookingId}`)
  );

  if (invalidRecords.length > 0) {
    const invalidStudentIds = invalidRecords.map((r) => r.studentId);
    throw new AppError(
      `Invalid or unconfirmed bookings for students: ${invalidStudentIds.join(', ')}`,
      400
    );
  }

  // Step 4: Check for locked records — prevent overwriting billed attendance
  const lockedRecords = await Attendance.find({
    messId: mess._id,
    date: normalizedDate,
    studentId: { $in: studentIds },
    lockedForBilling: true,
  }).select('studentId');

  if (lockedRecords.length > 0) {
    const lockedStudentIds = lockedRecords.map((r) => r.studentId.toString());
    throw new AppError(
      `Cannot modify attendance for ${lockedRecords.length} student(s) — bill already generated. Locked student IDs: ${lockedStudentIds.join(', ')}`,
      403
    );
  }

  // Step 5: Build the upsert payload with markedAt timestamps
  const now = new Date();
  const bulkRecords = records.map((record) => ({
    studentId: record.studentId,
    bookingId: record.bookingId,
    messId: mess._id,
    date: normalizedDate,
    breakfast: {
      status: record.breakfast,
      markedAt: record.breakfast !== 'absent' ? now : null,
    },
    lunch: {
      status: record.lunch,
      markedAt: record.lunch !== 'absent' ? now : null,
    },
    dinner: {
      status: record.dinner,
      markedAt: record.dinner !== 'absent' ? now : null,
    },
    markedBy: ownerId,
    notes: record.notes || '',
  }));

  // Step 6: Bulk upsert — single round-trip to MongoDB
  const result = await Attendance.bulkUpsertAttendance(bulkRecords);

  return {
    acknowledged: result.ok === 1,
    matched: result.matchedCount,
    modified: result.modifiedCount,
    upserted: result.upsertedCount,
    total: records.length,
  };
};

/**
 * Gets a quick summary of attendance for a mess on a given date.
 * Used for the stat cards at the top of the attendance panel.
 */
const getAttendanceSummary = async (messId, date) => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const billableStatuses = ['present', 'late'];

  const result = await Attendance.aggregate([
    {
      $match: {
        messId: new mongoose.Types.ObjectId(messId),
        date: normalizedDate,
      },
    },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        breakfastPresent: {
          $sum: {
            $cond: [{ $in: ['$breakfast.status', billableStatuses] }, 1, 0],
          },
        },
        lunchPresent: {
          $sum: {
            $cond: [{ $in: ['$lunch.status', billableStatuses] }, 1, 0],
          },
        },
        dinnerPresent: {
          $sum: {
            $cond: [{ $in: ['$dinner.status', billableStatuses] }, 1, 0],
          },
        },
        onLeave: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ['$breakfast.status', 'leave'] },
                  { $eq: ['$lunch.status', 'leave'] },
                  { $eq: ['$dinner.status', 'leave'] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalStudents: 1,
        breakfastPresent: 1,
        lunchPresent: 1,
        dinnerPresent: 1,
        onLeave: 1,
      },
    },
  ]);

  return result[0] || {
    totalStudents: 0,
    breakfastPresent: 0,
    lunchPresent: 0,
    dinnerPresent: 0,
    onLeave: 0,
  };
};

module.exports = {
  getAttendanceSheet,
  saveAttendance,
  getAttendanceSummary,
};
