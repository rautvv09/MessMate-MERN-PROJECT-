const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { createPaymentOrder, verifyPaymentSignature } = require('../controllers/paymentController');

const router = express.Router();

router.use(protect, restrictTo('student'));

router.post('/order', createPaymentOrder);
router.post('/verify', verifyPaymentSignature);

module.exports = router;
