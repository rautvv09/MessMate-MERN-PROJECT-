const catchAsync = require('../utils/catchAsync');
const { createOrder, verifyPayment } = require('../services/paymentService');

// @desc    Create a Razorpay order for a bill
// @route   POST /api/student/payments/order
// @access  Student only
exports.createPaymentOrder = catchAsync(async (req, res) => {
  const { billId } = req.body;
  
  const orderDetails = await createOrder(billId, req.user._id);

  res.status(200).json({
    success: true,
    data: orderDetails,
  });
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/student/payments/verify
// @access  Student only
exports.verifyPaymentSignature = catchAsync(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, billId } = req.body;

  const bill = await verifyPayment(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    billId,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    data: { paymentStatus: bill.paymentStatus },
  });
});
