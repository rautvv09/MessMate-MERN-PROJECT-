const Razorpay = require('razorpay');
const crypto = require('crypto');
const Bill = require('../models/Bill');
const config = require('../config/env');
const AppError = require('../utils/AppError');

// Initialize Razorpay instance
let razorpayInstance;
if (config.razorpay.keyId && config.razorpay.keySecret) {
  razorpayInstance = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
}

/**
 * Creates a Razorpay order for a specific bill.
 * 
 * @param {string} billId - The ID of the bill
 * @param {string} studentId - The student's user ID
 */
const createOrder = async (billId, studentId) => {
  if (!razorpayInstance) {
    throw new AppError('Razorpay is not configured on the server', 501);
  }

  const bill = await Bill.findOne({ _id: billId, studentId }).populate('messId', 'name');
  
  if (!bill) {
    throw new AppError('Bill not found', 404);
  }

  if (bill.paymentStatus === 'paid') {
    throw new AppError('Bill is already paid', 400);
  }

  // Calculate the pending amount in paise (Razorpay expects smallest currency unit)
  const pendingAmount = Math.max(bill.totalAmount - bill.paidAmount, 0);
  if (pendingAmount <= 0) {
    throw new AppError('No pending amount for this bill', 400);
  }

  const amountInPaise = Math.round(pendingAmount * 100);

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: `receipt_${bill.billNumber}`,
    notes: {
      billId: bill._id.toString(),
      messName: bill.messId.name,
    },
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    
    // Save the order ID to the bill
    bill.razorpayOrderId = order.id;
    await bill.save();

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.razorpay.keyId,
    };
  } catch (error) {
    console.error('Razorpay Error:', error);
    throw new AppError('Failed to create payment order', 500);
  }
};

/**
 * Verifies the Razorpay payment signature and marks the bill as paid.
 * 
 * @param {string} razorpayOrderId 
 * @param {string} razorpayPaymentId 
 * @param {string} razorpaySignature 
 * @param {string} billId 
 * @param {string} studentId 
 */
const verifyPayment = async (razorpayOrderId, razorpayPaymentId, razorpaySignature, billId, studentId) => {
  if (!razorpayInstance) {
    throw new AppError('Razorpay is not configured on the server', 501);
  }

  const bill = await Bill.findOne({ _id: billId, studentId, razorpayOrderId });
  
  if (!bill) {
    throw new AppError('Bill or order not found', 404);
  }

  // Verify signature
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new AppError('Invalid payment signature', 400);
  }

  // Signature is valid, mark bill as paid
  const pendingAmount = Math.max(bill.totalAmount - bill.paidAmount, 0);
  
  bill.paidAmount = bill.totalAmount; // Assuming full payment
  bill.paymentStatus = 'paid';
  bill.paymentMethod = 'razorpay';
  bill.razorpayPaymentId = razorpayPaymentId;
  bill.paidAt = new Date();

  await bill.save();

  return bill;
};

module.exports = {
  createOrder,
  verifyPayment,
};
