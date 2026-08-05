import api from './api';

export const getProfile = () => api.get('/users/me');
export const updateProfile = (data) => api.patch('/users/me', data);
export const updateAvatar = (formData) =>
  api.patch('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });