import axios from 'axios';
import Cookies from 'js-cookie';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1') && !envUrl.includes('172.') && !envUrl.includes('192.168.')) {
    return envUrl;
  }
  const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  return `http://${hostname}:5000/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // REQUIRED — sends httpOnly cookies on every cross-origin request
});

// Attach the readable CSRF cookie's value as a header on every state-changing request
api.interceptors.request.use((config) => {
  const csrfToken = Cookies.get('csrfToken');
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['x-csrf-token'] = csrfToken;
  }
  return config;
});

// Silent access-token renewal on expiry, with a queue to avoid a "thundering herd"
// of simultaneous refresh calls if multiple requests expire at once
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isExpired = error.response?.data?.errorCode === 'TOKEN_EXPIRED';
    const isRefreshCall = originalRequest.url.includes('/auth/refresh');

    if (isExpired && !originalRequest._retry && !isRefreshCall) {
      if (isRefreshing) {
        // Another request already triggered a refresh — wait for it instead of
        // firing a second, redundant refresh call
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest); // retry the original request with the new cookie now set
      } catch (refreshError) {
        processQueue(refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && !isExpired) {
      // A genuine, non-refreshable auth failure (invalid token, no session at all)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;