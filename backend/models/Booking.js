const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messId: { type: mongoose.Schema.Types.ObjectId, ref: 'MessListing', required: true },
    planType: {
      type: String,
      enum: ['Full Day', 'Lunch & Dinner', 'Lunch Only', 'Dinner Only'],
      required: true,
    },
    durationMonths: { type: Number, enum: [1, 3, 6], required: true },
    joiningDate: { type: Date, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    priceSnapshot: {
      planCost: { type: Number, required: true, min: 0 },
      discountApplied: { type: Number, default: 0, min: 0 },
      deposit: { type: Number, required: true, min: 0 },
      registrationFee: { type: Number, required: true, min: 0 },
      totalPayable: { type: Number, required: true, min: 0 },
    },
    status: {
      type: String,
      enum: ['confirmed', 'waitlisted', 'cancelled', 'completed', 'expired'],
      default: 'confirmed',
    },
    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: null, maxlength: 300 },
  },
  { timestamps: true }
);

bookingSchema.pre('save', async function () {
  // Sync startDate with joiningDate
  if (this.joiningDate && !this.startDate) {
    this.startDate = new Date(this.joiningDate);
  }

  // Auto-calculate endDate from joiningDate and durationMonths
  if (this.joiningDate && this.durationMonths && !this.endDate) {
    const end = new Date(this.joiningDate);
    end.setMonth(end.getMonth() + this.durationMonths);
    this.endDate = end;
  }

  if (!this.isNew) return;
  const year = new Date().getFullYear();
  const count = await mongoose.model('Booking').countDocuments({
    createdAt: { $gte: new Date(`${year}-01-01`) },
  });
  this.bookingId = `MM-${year}-${String(count + 1).padStart(5, '0')}`;
});

bookingSchema.index({ studentId: 1, createdAt: -1 });
bookingSchema.index({ messId: 1, status: 1 });

// Atomic race-condition protection: ensures a student can have at most ONE confirmed active subscription
bookingSchema.index(
  { studentId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'confirmed' },
    name: 'unique_active_student_subscription',
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
