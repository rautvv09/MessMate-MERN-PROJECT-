const mongoose = require('mongoose');
const MessListing = require('./MessListing');

const reviewSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messId: { type: mongoose.Schema.Types.ObjectId, ref: 'MessListing', required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: { validator: Number.isInteger, message: 'Rating must be a whole number' },
    },
    comment: { type: String, required: true, trim: true, minlength: 5, maxlength: 1000 },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ studentId: 1, messId: 1 }, { unique: true });
reviewSchema.index({ messId: 1, createdAt: -1 });

reviewSchema.statics.recalculateMessRating = async function (messId) {
  const stats = await this.aggregate([
    { $match: { messId: new mongoose.Types.ObjectId(messId) } },
    { $group: { _id: '$messId', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await MessListing.findByIdAndUpdate(messId, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].reviewCount,
    });
  } else {
    await MessListing.findByIdAndUpdate(messId, { 'rating.average': 0, 'rating.count': 0 });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.recalculateMessRating(this.messId);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.recalculateMessRating(doc.messId);
  }
});

module.exports = mongoose.model('Review', reviewSchema);