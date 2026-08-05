const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification, // if you added it above
} = require('../controllers/notificationController');

const router = express.Router();

router.use(protect); // both students and owners receive notifications, so no restrictTo here

router.get('/me', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification); // if added

module.exports = router;