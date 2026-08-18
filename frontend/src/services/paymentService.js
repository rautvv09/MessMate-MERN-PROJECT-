import api from './api';

// Utility to dynamically load the Razorpay script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const createPaymentOrder = (billId) =>
  api.post('/student/payments/order', { billId });

export const verifyPaymentSignature = (paymentData) =>
  api.post('/student/payments/verify', paymentData);
