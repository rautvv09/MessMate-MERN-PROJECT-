import api from './api';

export const getDashboardStats = () => api.get('/owner/dashboard');
export const getMyMesses = () => api.get('/owner/messes');
export const getMessBookings = (messId) => api.get(`/owner/messes/${messId}/bookings`);