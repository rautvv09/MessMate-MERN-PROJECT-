import api from './api';

// Get the attendance sheet (booked students + pre-filled records for a date)
export const getAttendanceSheet = (messId, date) =>
  api.get(`/owner/messes/${messId}/attendance`, { params: { date } });

// Save attendance for all students on a given date
export const saveAttendance = (messId, data) =>
  api.post(`/owner/messes/${messId}/attendance`, data);

// Get attendance summary stats for a date
export const getAttendanceSummary = (messId, date) =>
  api.get(`/owner/messes/${messId}/attendance/summary`, { params: { date } });
