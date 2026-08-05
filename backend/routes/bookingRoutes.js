const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  previewPrice, createBooking, getMyBookings, getBooking, cancelBooking,
} = require('../controllers/bookingController');

const router = express.Router();

router.get('/messes/:messId/booking-preview', protect, restrictTo('student'), previewPrice);
router.post('/messes/:messId/bookings', protect, restrictTo('student'), createBooking);
router.get('/bookings/me', protect, restrictTo('student'), getMyBookings);
router.get('/bookings/:id', protect, restrictTo('student'), getBooking);
router.patch('/bookings/:id/cancel', protect, restrictTo('student'), cancelBooking);

module.exports = router;
