import api from './api';

export const getMyNotifications = (params) => api.get('/notifications/me', { params });
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllAsRead = () => api.patch('/notifications/read-all');