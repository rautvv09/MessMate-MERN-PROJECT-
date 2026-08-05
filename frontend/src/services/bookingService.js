import api from './api';

export const previewPrice = (messId, params) =>
  api.get(`/messes/${messId}/booking-preview`, { params });
export const createBooking = (messId, data) => api.post(`/messes/${messId}/bookings`, data);
export const getMyBookings = () => api.get('/bookings/me');
export const cancelBooking = (bookingId, data) => api.patch(`/bookings/${bookingId}/cancel`, data);