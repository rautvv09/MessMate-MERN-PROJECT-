import api from './api';

// Get student's active bookings (for mess selector)
export const getMyAttendanceBookings = () =>
  api.get('/student/attendance/bookings');

// Get monthly attendance statistics
export const getMonthlyStats = (bookingId, year, month) =>
  api.get('/student/attendance/stats', {
    params: { bookingId, year, month },
  });

// Get daily attendance records for calendar view
export const getMonthlyCalendar = (bookingId, year, month) =>
  api.get('/student/attendance/calendar', {
    params: { bookingId, year, month },
  });

// Get paginated attendance history
export const getAttendanceHistory = (page = 1, limit = 30) =>
  api.get('/student/attendance/history', {
    params: { page, limit },
  });

// Student marks daily attendance
export const markStudentAttendance = (data) =>
  api.post('/student/attendance/mark', data);
