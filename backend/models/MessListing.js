const mongoose = require('mongoose');

const messListingSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    foodType: { type: String, enum: ['veg', 'non-veg', 'both'], required: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: {
        type: [Number],
        required: [true, 'Location coordinates are required'],
        default: [74.4595, 16.6976],
      },
    },
    pricing: {
      baseFee: { type: Number, required: true, min: 0 },
      deposit: { type: Number, default: 0, min: 0 },
      registrationFee: { type: Number, default: 0, min: 0 },
    },
    mealPricing: {
      breakfast: { type: Number, default: 40, min: 0 },
      lunch: { type: Number, default: 70, min: 0 },
      dinner: { type: Number, default: 70, min: 0 },
      fullDay: { type: Number, default: 180, min: 0 },
      gstPercentage: { type: Number, default: 5, min: 0, max: 28 },
    },
    totalSeats: { type: Number, required: true, min: 1 },
    facilities: {
      type: [String],
      enum: ['AC_DINING', 'HOME_DELIVERY', 'UNLIMITED_ROTI', 'HYGIENE_CERTIFIED', 'PARKING', 'CCTV', 'WIFI', 'CARD_UPI_PAYMENT'],
      default: [],
    },
    tags: { type: [String], default: [] },
    nearbyColleges: { type: [String], default: [] },
    gallery: [{ url: { type: String, required: true }, publicId: { type: String, required: true }, _id: false }],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messListingSchema.index({ location: '2dsphere' });
messListingSchema.index({ city: 1, isActive: 1 });
messListingSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('MessListing', messListingSchema);