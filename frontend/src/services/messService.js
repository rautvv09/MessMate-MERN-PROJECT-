import api from './api';

export const getAllMesses = (params) => api.get('/messes', { params });
export const getMess = (id) => api.get(`/messes/${id}`);
export const getNearbyMesses = (params) => api.get('/messes/nearby', { params });
export const createMess = (data) => api.post('/messes', data);
export const updateMess = (id, data) => api.patch(`/messes/${id}`, data);
export const deleteMess = (id) => api.delete(`/messes/${id}`);