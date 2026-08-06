const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register, login, googleAuth, verifyEmail, resendVerification,
  refresh, logout, logoutAll, forgotPassword, resetPassword,
} = require('../controllers/authController');
const {
  registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation,
} = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});
const forgotPasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 3,
  message: { success: false, message: 'Too many password reset requests. Please try again in an hour.' },
});

router.post('/register', registerValidation, validate, register);
router.post('/login', loginRateLimiter, loginValidation, validate, login);
router.post('/google', googleAuth);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);
router.post('/forgot-password', forgotPasswordRateLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

module.exports = router;