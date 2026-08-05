import api from './api';

export const registerStudent = (data) => api.post('/auth/register/student', data);
export const registerOwner = (data) => api.post('/auth/register/owner', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');