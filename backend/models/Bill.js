const mongoose = require('mongoose');

// ==================== BILL SCHEMA ====================
// Represents a monthly invoice generated from attendance records.
// Once generated, the corresponding attendance records are locked
// (lockedForBilling = true) to prevent retroactive modifications.
const billSchema = new mongoose.Schema(
  {
    // Human-readable sequential bill number: INV-2026-00001
    billNumber: {
      type: String,
      unique: true,
      required: true,
    },

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

    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessListing',
      required: [true, 'Mess ID is required'],
    },

    // The owner who generated this bill
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Generated-by user ID is required'],
    },

    // ==================== BILLING PERIOD ====================
    billingPeriod: {
      year: { type: Number, required: true },
      month: { type: Number, required: true, min: 1, max: 12 },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },

    // ==================== MEAL COUNTS (from attendance) ====================
    mealCounts: {
      breakfastCount: { type: Number, required: true, min: 0 },
      lunchCount: { type: Number, required: true, min: 0 },
      dinnerCount: { type: Number, required: true, min: 0 },
      totalDays: { type: Number, required: true, min: 0 },
      totalMeals: { type: Number, required: true, min: 0 },
    },

    // ==================== PRICE SNAPSHOT (frozen at generation time) ====================
    // Prices are snapshotted so that future price changes don't alter past bills.
    priceSnapshot: {
      breakfastPrice: { type: Number, required: true, min: 0 },
      lunchPrice: { type: Number, required: true, min: 0 },
      dinnerPrice: { type: Number, required: true, min: 0 },
      gstPercentage: { type: Number, required: true, min: 0 },
    },

    // ==================== BILL CALCULATION ====================
    // breakfastCount × breakfastPrice
    breakfastTotal: { type: Number, required: true, min: 0 },
    // lunchCount × lunchPrice
    lunchTotal: { type: Number, required: true, min: 0 },
    // dinnerCount × dinnerPrice
    dinnerTotal: { type: Number, required: true, min: 0 },

    // Sum of meal totals (before extras)
    mealSubtotal: { type: Number, required: true, min: 0 },

    // Extra charges
    deposit: { type: Number, default: 0, min: 0 },
    registrationFee: { type: Number, default: 0, min: 0 },

    // Subtotal before tax = mealSubtotal + deposit + registrationFee
    subtotal: { type: Number, required: true, min: 0 },

    // Discount (flat amount)
    discount: { type: Number, default: 0, min: 0 },

    // After discount
    taxableAmount: { type: Number, required: true, min: 0 },

    // GST
    gstAmount: { type: Number, required: true, min: 0 },

    // Final amount = taxableAmount + gstAmount
    totalAmount: { type: Number, required: true, min: 0 },

    // ==================== PAYMENT STATUS ====================
    dueDate: {
      type: Date,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'partially_paid'],
      default: 'pending',
    },

    paidAmount: { type: Number, default: 0, min: 0 },
    paidAt: { type: Date, default: null },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'card', 'razorpay', 'other', null],
      default: null,
    },

    // Razorpay specific fields
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },

    // ==================== META ====================
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    // Plan type at the time of billing (denormalized for display)
    planType: {
      type: String,
      enum: ['Full Day', 'Lunch & Dinner', 'Lunch Only', 'Dinner Only'],
      required: true,
    },
  },
  { timestamps: true }
);

// ==================== INDEXES ====================

// Uniqueness: one bill per booking per month
billSchema.index(
  { bookingId: 1, 'billingPeriod.year': 1, 'billingPeriod.month': 1 },
  { unique: true, name: 'unique_booking_month' }
);

// Owner's bill listing: "Show all bills for my mess"
billSchema.index(
  { messId: 1, createdAt: -1 },
  { name: 'mess_bills' }
);

// Student's bill history: "Show my bills newest-first"
billSchema.index(
  { studentId: 1, createdAt: -1 },
  { name: 'student_bills' }
);

// Payment tracking: "Find all overdue bills"
billSchema.index(
  { paymentStatus: 1, dueDate: 1 },
  { name: 'payment_tracking' }
);

// Bill number lookup
billSchema.index(
  { billNumber: 1 },
  { unique: true, name: 'bill_number_lookup' }
);

// ==================== BILL NUMBER GENERATION ====================
billSchema.pre('save', async function () {
  if (!this.isNew) return;

  const year = new Date().getFullYear();
  const count = await mongoose.model('Bill').countDocuments({
    createdAt: { $gte: new Date(`${year}-01-01`) },
  });

  this.billNumber = `INV-${year}-${String(count + 1).padStart(5, '0')}`;
});

// ==================== INSTANCE METHODS ====================

// Check if the bill is fully paid
billSchema.methods.isFullyPaid = function () {
  return this.paidAmount >= this.totalAmount;
};

// Get the outstanding balance
billSchema.methods.getOutstandingBalance = function () {
  return Math.max(this.totalAmount - this.paidAmount, 0);
};

// Mark bill as paid
billSchema.methods.markAsPaid = function (method, amount) {
  this.paidAmount = amount || this.totalAmount;
  this.paidAt = new Date();
  this.paymentMethod = method || 'cash';
  this.paymentStatus = this.paidAmount >= this.totalAmount ? 'paid' : 'partially_paid';
};

module.exports = mongoose.model('Bill', billSchema);
