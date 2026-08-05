import api from './api';

export const getMenu = (messId) => api.get(`/messes/${messId}/menu`);
export const getTodayMenu = (messId) => api.get(`/messes/${messId}/menu/today`);
export const updateDayMenu = (messId, day, data) => api.patch(`/messes/${messId}/menu/${day}`, data);
export const updateBreakfast = (messId, breakfast) =>
  api.patch(`/messes/${messId}/menu/breakfast`, { breakfast });