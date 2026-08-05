const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messId: { type: mongoose.Schema.Types.ObjectId, ref: 'MessListing', required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ studentId: 1, messId: 1 }, { unique: true });
favoriteSchema.index({ messId: 1 });

module.exports = mongoose.model('Favorite', favoriteSchema);