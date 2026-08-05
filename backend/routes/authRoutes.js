const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  registerStudent,
  registerOwner,
  login,
  getMe,
} = require('../controllers/authController');

const router = express.Router();

const studentValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit phone number is required'),
  body('college').trim().notEmpty().withMessage('College is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
];

const ownerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit phone number is required'),
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register/student', studentValidation, validate, registerStudent);
router.post('/register/owner', ownerValidation, validate, registerOwner);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);

module.exports = router;