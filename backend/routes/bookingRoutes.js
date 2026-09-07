const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  previewPrice,
  createBooking,
  getMyBookings,
  getActiveSubscription,
  getBooking,
  cancelBooking,
} = require('../controllers/bookingController');

const router = express.Router();

// Active subscription check
router.get('/bookings/active', protect, restrictTo('student'), getActiveSubscription);
router.get('/subscriptions/active', protect, restrictTo('student'), getActiveSubscription);

// Booking / Subscription CRUD
router.get('/messes/:messId/booking-preview', protect, restrictTo('student'), previewPrice);
router.post('/messes/:messId/bookings', protect, restrictTo('student'), createBooking);
router.post('/subscriptions', protect, restrictTo('student'), createBooking);

router.get('/bookings/me', protect, restrictTo('student'), getMyBookings);
router.get('/subscriptions/me', protect, restrictTo('student'), getMyBookings);

router.get('/bookings/:id', protect, restrictTo('student'), getBooking);
router.get('/subscriptions/:id', protect, restrictTo('student'), getBooking);

router.patch('/bookings/:id/cancel', protect, restrictTo('student'), cancelBooking);
router.post('/subscriptions/:id/cancel', protect, restrictTo('student'), cancelBooking);

module.exports = router;
