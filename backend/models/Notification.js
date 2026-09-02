const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'booking_success',
        'booking_cancelled',
        'booking_waitlisted',
        'profile_updated',
        'new_mess_added',
        'bill_generated',
      ],
      required: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 300 },
    relatedEntity: {
      type: { type: String, enum: ['Booking', 'MessListing', 'Bill'] },
      id: { type: mongoose.Schema.Types.ObjectId, refPath: 'relatedEntity.type' },
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model('Notification', notificationSchema);