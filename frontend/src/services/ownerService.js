import api from './api';

export const getDashboardStats = () => api.get('/owner/dashboard');
export const getMyMesses = () => api.get('/owner/messes');
export const getMessBookings = (messId) => api.get(`/owner/messes/${messId}/bookings`);
export const getMessStudents = (messId) => api.get(`/owner/messes/${messId}/students`);
export const getStudentAttendanceForOwner = (messId, studentId, year, month) =>
  api.get(`/owner/messes/${messId}/students/${studentId}/attendance`, {
    params: { year, month },
  });