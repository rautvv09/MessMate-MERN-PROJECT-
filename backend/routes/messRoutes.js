const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  createMess, getMess, getAllMesses,
  getNearbyMesses, updateMess, deleteMess,
} = require('../controllers/messController');

const router = express.Router();

// ---- Public routes ----
router.get('/', getAllMesses);
router.get('/nearby', getNearbyMesses);
router.get('/:id', getMess);

// ---- Owner-protected routes ----
router.post('/', protect, restrictTo('owner'), createMess);
router.patch('/:id', protect, restrictTo('owner'), updateMess);
router.delete('/:id', protect, restrictTo('owner'), deleteMess);

module.exports = router;