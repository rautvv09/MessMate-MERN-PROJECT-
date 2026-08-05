const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getMyMesses,
  getDashboardStats,
  getMessBookings,
} = require('../controllers/ownerController');

const router = express.Router();

router.use(protect, restrictTo('owner')); // every route below requires an authenticated owner

router.get('/dashboard', getDashboardStats);
router.get('/messes', getMyMesses);
router.get('/messes/:messId/bookings', getMessBookings);

module.exports = router;