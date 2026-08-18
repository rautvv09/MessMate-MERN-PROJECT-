const mongoose = require('mongoose');

// ==================== MEAL SUB-SCHEMA ====================
// Reusable sub-document for each meal slot (breakfast, lunch, dinner).
// Each meal independently tracks its own status and the exact timestamp
// when the owner marked it — this granularity is essential for audit
// trails and dispute resolution.
const MEAL_STATUSES = ['present', 'absent', 'leave', 'holiday', 'late'];

const mealSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: {
        values: MEAL_STATUSES,
        message: 'Meal status must be one of: present, absent, leave, holiday, late',
      },
      required: [true, 'Meal status is required'],
      default: 'absent',
    },
    markedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

// ==================== ATTENDANCE SCHEMA ====================
const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
    },

    // Denormalized from Booking.messId for query performance.
    // The owner's daily panel filters by messId + date — without this
    // denormalization, every panel load would require a $lookup through
    // Booking just to reach the mess, adding ~50ms latency per query.
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessListing',
      required: [true, 'Mess ID is required'],
    },

    // Calendar date normalized to midnight (start of day).
    // All date comparisons use this normalized form so that timezone
    // differences don't create duplicate or missing records.
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      validate: {
        validator: function (value) {
          // Attendance cannot be marked for future dates
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return value <= today;
        },
        message: 'Attendance cannot be marked for a future date',
      },
    },

    breakfast: {
      type: mealSchema,
      default: () => ({ status: 'absent', markedAt: null }),
    },

    lunch: {
      type: mealSchema,
      default: () => ({ status: 'absent', markedAt: null }),
    },

    dinner: {
      type: mealSchema,
      default: () => ({ status: 'absent', markedAt: null }),
    },

    // The owner (or admin) who marked/saved this attendance record.
    // Critical for audit trails in Phase 8.
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Marked-by user ID is required'],
    },

    // Once a monthly bill has been generated from this record, it
    // becomes immutable. The billing service sets this to `true` and
    // the pre-save hook prevents any further modifications.
    lockedForBilling: {
      type: Boolean,
      default: false,
    },

    // Free-text field for edge cases: "Student arrived 30 min late",
    // "Mess closed early due to power outage", etc.
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// ==================== INDEXES ====================

// 1. Uniqueness: one attendance record per student per mess per day.
//    This is the most critical index — it prevents duplicate records
//    and is enforced at the database level, not just application level.
attendanceSchema.index(
  { studentId: 1, messId: 1, date: 1 },
  { unique: true, name: 'unique_student_mess_date' }
);

// 2. Owner's daily attendance panel: "Show all students for my mess today"
//    This is the single most frequent query in the system.
attendanceSchema.index(
  { messId: 1, date: 1 },
  { name: 'owner_daily_panel' }
);

// 3. Student's attendance history: "Show my attendance newest-first"
//    Used by the student dashboard calendar and attendance statistics.
attendanceSchema.index(
  { studentId: 1, date: -1 },
  { name: 'student_history' }
);

// 4. Monthly bill generation: "Sum all meals for this booking in a date range"
//    Used by the billing aggregation pipeline in Phase 4.
attendanceSchema.index(
  { bookingId: 1, date: 1 },
  { name: 'billing_aggregation' }
);

// 5. Billing lock filter: "Find all unlocked records for a mess"
//    Used when generating bills to identify records that haven't been billed yet.
attendanceSchema.index(
  { messId: 1, lockedForBilling: 1 },
  { name: 'billing_lock_filter' }
);

// ==================== PRE-SAVE HOOKS ====================

// Normalize the date to midnight (start of day) to ensure consistent
// querying. Without this, two records marked at 09:00 and 14:00 on
// the same day would have different `date` values and the unique
// index wouldn't catch the duplicate.
attendanceSchema.pre('save', function (next) {
  if (this.isModified('date')) {
    const d = new Date(this.date);
    d.setHours(0, 0, 0, 0);
    this.date = d;
  }
  next();
});

// Prevent modifications to attendance records that have already been
// locked for billing. This is the first line of defense — the
// controller layer adds a second check (defense in depth).
attendanceSchema.pre('save', function (next) {
  if (!this.isNew && this.isModified() && !this.isModified('lockedForBilling')) {
    // If the document is being modified AND it was previously locked,
    // reject the save. The only allowed modification to a locked
    // record is the billing service setting lockedForBilling itself.
    if (this._original_lockedForBilling === true) {
      const error = new Error('Cannot modify attendance after bill has been generated');
      error.statusCode = 403;
      return next(error);
    }
  }
  next();
});

// Capture the original lockedForBilling value before any modifications
// so the pre-save hook above can detect changes to locked records.
attendanceSchema.pre('init', function (doc) {
  this._original_lockedForBilling = doc.lockedForBilling;
});

// Automatically set markedAt timestamps when meal statuses change
attendanceSchema.pre('save', function (next) {
  const now = new Date();
  const meals = ['breakfast', 'lunch', 'dinner'];

  for (const meal of meals) {
    if (this.isModified(`${meal}.status`)) {
      if (this[meal].status === 'absent' && this.isNew) {
        // Default state on creation — no timestamp needed
        this[meal].markedAt = null;
      } else {
        this[meal].markedAt = now;
      }
    }
  }

  next();
});

// ==================== INSTANCE METHODS ====================

// Check if a specific meal is billable (present or late = charged)
attendanceSchema.methods.isMealBillable = function (mealType) {
  const billableStatuses = ['present', 'late'];
  return billableStatuses.includes(this[mealType]?.status);
};

// Get a summary object for this day's attendance
attendanceSchema.methods.getDaySummary = function () {
  const billableStatuses = ['present', 'late'];
  return {
    date: this.date,
    breakfast: this.breakfast.status,
    lunch: this.lunch.status,
    dinner: this.dinner.status,
    mealsConsumed: ['breakfast', 'lunch', 'dinner'].filter(
      (meal) => billableStatuses.includes(this[meal].status)
    ).length,
    isLocked: this.lockedForBilling,
  };
};

// ==================== STATIC METHODS ====================

// Bulk upsert attendance for multiple students on a single date.
// Used by the owner's "Save Attendance" action in Phase 2.
// Uses bulkWrite for a single round-trip to MongoDB instead of
// N individual writes — critical for performance with 50+ students.
attendanceSchema.statics.bulkUpsertAttendance = async function (records) {
  const operations = records.map((record) => {
    // Normalize date to midnight
    const normalizedDate = new Date(record.date);
    normalizedDate.setHours(0, 0, 0, 0);

    return {
      updateOne: {
        filter: {
          studentId: record.studentId,
          messId: record.messId,
          date: normalizedDate,
        },
        update: {
          $set: {
            bookingId: record.bookingId,
            breakfast: record.breakfast,
            lunch: record.lunch,
            dinner: record.dinner,
            markedBy: record.markedBy,
            notes: record.notes || '',
          },
          $setOnInsert: {
            lockedForBilling: false,
          },
        },
        upsert: true,
      },
    };
  });

  return this.bulkWrite(operations, { ordered: false });
};

// Get attendance statistics for a student within a date range.
// Used by the student dashboard in Phase 3 and billing in Phase 4.
attendanceSchema.statics.getStudentStats = async function (studentId, startDate, endDate) {
  const billableStatuses = ['present', 'late'];

  const result = await this.aggregate([
    {
      $match: {
        studentId: new mongoose.Types.ObjectId(studentId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        breakfastTaken: {
          $sum: { $cond: [{ $in: ['$breakfast.status', billableStatuses] }, 1, 0] },
        },
        lunchTaken: {
          $sum: { $cond: [{ $in: ['$lunch.status', billableStatuses] }, 1, 0] },
        },
        dinnerTaken: {
          $sum: { $cond: [{ $in: ['$dinner.status', billableStatuses] }, 1, 0] },
        },
        breakfastMissed: {
          $sum: { $cond: [{ $eq: ['$breakfast.status', 'absent'] }, 1, 0] },
        },
        lunchMissed: {
          $sum: { $cond: [{ $eq: ['$lunch.status', 'absent'] }, 1, 0] },
        },
        dinnerMissed: {
          $sum: { $cond: [{ $eq: ['$dinner.status', 'absent'] }, 1, 0] },
        },
        leaveDays: {
          $sum: {
            $cond: [
              {
                $and: [
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
        holidayDays: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$breakfast.status', 'holiday'] },
                  { $eq: ['$lunch.status', 'holiday'] },
                  { $eq: ['$dinner.status', 'holiday'] },
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
        totalDays: 1,
        breakfastTaken: 1,
        lunchTaken: 1,
        dinnerTaken: 1,
        breakfastMissed: 1,
        lunchMissed: 1,
        dinnerMissed: 1,
        totalMealsConsumed: {
          $add: ['$breakfastTaken', '$lunchTaken', '$dinnerTaken'],
        },
        totalMealsMissed: {
          $add: ['$breakfastMissed', '$lunchMissed', '$dinnerMissed'],
        },
        leaveDays: 1,
        holidayDays: 1,
        attendancePercentage: {
          $cond: [
            { $eq: ['$totalDays', 0] },
            0,
            {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        { $add: ['$breakfastTaken', '$lunchTaken', '$dinnerTaken'] },
                        { $multiply: ['$totalDays', 3] },
                      ],
                    },
                    100,
                  ],
                },
                1,
              ],
            },
          ],
        },
      },
    },
  ]);

  return result[0] || {
    totalDays: 0,
    breakfastTaken: 0,
    lunchTaken: 0,
    dinnerTaken: 0,
    breakfastMissed: 0,
    lunchMissed: 0,
    dinnerMissed: 0,
    totalMealsConsumed: 0,
    totalMealsMissed: 0,
    leaveDays: 0,
    holidayDays: 0,
    attendancePercentage: 0,
  };
};

// Get billing-ready meal counts for a specific booking in a date range.
// Used by the billing engine in Phase 4 to compute the monthly bill.
attendanceSchema.statics.getBillingMealCounts = async function (bookingId, startDate, endDate) {
  const billableStatuses = ['present', 'late'];

  const result = await this.aggregate([
    {
      $match: {
        bookingId: new mongoose.Types.ObjectId(bookingId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        breakfastCount: {
          $sum: { $cond: [{ $in: ['$breakfast.status', billableStatuses] }, 1, 0] },
        },
        lunchCount: {
          $sum: { $cond: [{ $in: ['$lunch.status', billableStatuses] }, 1, 0] },
        },
        dinnerCount: {
          $sum: { $cond: [{ $in: ['$dinner.status', billableStatuses] }, 1, 0] },
        },
        totalDays: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        breakfastCount: 1,
        lunchCount: 1,
        dinnerCount: 1,
        totalDays: 1,
        totalMeals: { $add: ['$breakfastCount', '$lunchCount', '$dinnerCount'] },
      },
    },
  ]);

  return result[0] || {
    breakfastCount: 0,
    lunchCount: 0,
    dinnerCount: 0,
    totalDays: 0,
    totalMeals: 0,
  };
};

// Expose the valid meal statuses for use in validators and controllers
attendanceSchema.statics.MEAL_STATUSES = MEAL_STATUSES;
attendanceSchema.statics.BILLABLE_STATUSES = ['present', 'late'];

module.exports = mongoose.model('Attendance', attendanceSchema);
