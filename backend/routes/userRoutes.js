const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  updateAvatar,
} = require('../controllers/userController');

const router = express.Router();

router.use(protect); // every route below requires authentication

router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.patch('/me/avatar', upload.single('avatar'), updateAvatar);

module.exports = router;