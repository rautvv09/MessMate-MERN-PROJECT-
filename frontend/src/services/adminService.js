import api from './api';

// 1. Dashboard Stats
export const getDashboardStats = () => api.get('/admin/dashboard/stats');

// 2. Students Management
export const getStudents = (params) => api.get('/admin/students', { params });
export const getStudentById = (id) => api.get(`/admin/students/${id}`);
export const updateStudentStatus = (id, data) => api.patch(`/admin/students/${id}/status`, data);
export const deleteStudent = (id) => api.delete(`/admin/students/${id}`);

// 3. Owners Management
export const getOwners = (params) => api.get('/admin/owners', { params });
export const getOwnerById = (id) => api.get(`/admin/owners/${id}`);
export const updateOwnerStatus = (id, data) => api.patch(`/admin/owners/${id}/status`, data);
export const deleteOwner = (id) => api.delete(`/admin/owners/${id}`);

// 4. Messes Management
export const getMesses = (params) => api.get('/admin/messes', { params });
export const getMessById = (id) => api.get(`/admin/messes/${id}`);
export const updateMessStatus = (id, data) => api.patch(`/admin/messes/${id}/status`, data);
export const deleteMess = (id) => api.delete(`/admin/messes/${id}`);

// 5. Bookings Monitor
export const getBookings = (params) => api.get('/admin/bookings', { params });
export const getBookingById = (id) => api.get(`/admin/bookings/${id}`);

// 6. Reviews Moderation
export const getReviews = (params) => api.get('/admin/reviews', { params });
export const deleteReview = (id) => api.delete(`/admin/reviews/${id}`);

// 7. Audit Logs
export const getAuditLogs = (params) => api.get('/admin/audit-logs', { params });
