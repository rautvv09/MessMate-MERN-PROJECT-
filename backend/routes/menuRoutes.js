const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getMenu, getTodayMenu, updateDayMenu, updateBreakfast,
} = require('../controllers/menuController');

const router = express.Router();

// ---- Public routes ----
router.get('/:messId/menu', getMenu);
router.get('/:messId/menu/today', getTodayMenu);

// ---- Owner-protected routes ----
router.patch('/:messId/menu/breakfast', protect, restrictTo('owner'), updateBreakfast);
router.patch('/:messId/menu/:day', protect, restrictTo('owner'), updateDayMenu);

module.exports = router;