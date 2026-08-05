const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadGalleryImages,
  deleteGalleryImage,
} = require('../controllers/galleryController');

const router = express.Router();

router.post('/:messId/gallery', protect, restrictTo('owner'), upload.array('images', 10), uploadGalleryImages);
router.delete('/:messId/gallery/:publicId', protect, restrictTo('owner'), deleteGalleryImage);

module.exports = router;
