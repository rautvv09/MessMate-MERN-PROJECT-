import api from './api';

export const getRevenueReport = (messId, months = 6) =>
  api.get(`/owner/messes/${messId}/reports/revenue`, { params: { months } });

export const getAttendanceReport = (messId) =>
  api.get(`/owner/messes/${messId}/reports/attendance`);

export const getStudentReport = (messId) =>
  api.get(`/owner/messes/${messId}/reports/students`);
