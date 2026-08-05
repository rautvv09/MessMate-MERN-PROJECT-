const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  addFavorite, removeFavorite, getMyFavorites, checkFavorites,
} = require('../controllers/favoriteController');

const router = express.Router();

router.post('/messes/:messId/favorite', protect, restrictTo('student'), addFavorite);
router.delete('/messes/:messId/favorite', protect, restrictTo('student'), removeFavorite);
router.get('/favorites/me', protect, restrictTo('student'), getMyFavorites);
router.post('/favorites/check', protect, restrictTo('student'), checkFavorites);

module.exports = router;
