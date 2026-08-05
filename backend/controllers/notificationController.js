const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Get logged-in user's notifications, newest first, paginated
// @route   GET /api/notifications/me
exports.getMyNotifications = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedEntity.id'), // refPath resolves the correct model automatically
    Notification.countDocuments({ userId: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    results: notifications.length,
    pagination: { total, page, pages: Math.ceil(total / limit) },
    data: { notifications },
  });
});

// @desc    Get unread notification count (for a badge icon)
// @route   GET /api/notifications/unread-count
exports.getUnreadCount = catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });

  res.status(200).json({ success: true, data: { count } });
});

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({ success: true, data: { notification } });
});

// @desc    Mark all of the logged-in user's notifications as read
// @route   PATCH /api/notifications/read-all
exports.markAllAsRead = catchAsync(async (req, res) => {
  const result = await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} notification(s) marked as read`,
  });
});

// @desc    Delete one of the logged-in user's notifications
// @route   DELETE /api/notifications/:id
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(204).send();
});
