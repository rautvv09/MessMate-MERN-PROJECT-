import api from './api';

export const previewPrice = (messId, params) =>
  api.get(`/messes/${messId}/booking-preview`, { params });

export const createBooking = (messId, data) =>
  api.post(`/messes/${messId}/bookings`, data);

export const getMyBookings = () =>
  api.get('/bookings/me');

export const getActiveSubscription = () =>
  api.get('/bookings/active');

export const cancelBooking = (bookingId, data) =>
  api.patch(`/bookings/${bookingId}/cancel`, data);

export const cancelSubscription = (subscriptionId, data) =>
  api.post(`/subscriptions/${subscriptionId}/cancel`, data);