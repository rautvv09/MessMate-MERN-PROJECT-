const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  createOrEditReview, getMessReviews, getMyReviewForMess, deleteReview,
} = require('../controllers/reviewController');

const router = express.Router();

// ---- Public ----
router.get('/messes/:messId/reviews', getMessReviews);

// ---- Student-protected ----
router.get('/messes/:messId/reviews/me', protect, restrictTo('student'), getMyReviewForMess);
router.post('/messes/:messId/reviews', protect, restrictTo('student'), createOrEditReview);
router.delete('/reviews/:id', protect, restrictTo('student'), deleteReview);

module.exports = router;