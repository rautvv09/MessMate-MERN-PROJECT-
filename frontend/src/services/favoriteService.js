import api from './api';

export const addFavorite = (messId) => api.post(`/messes/${messId}/favorite`);
export const removeFavorite = (messId) => api.delete(`/messes/${messId}/favorite`);
export const getMyFavorites = () => api.get('/favorites/me');
export const checkFavorites = (messIds) => api.post('/favorites/check', { messIds });
