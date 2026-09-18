import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to outgoing requests if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edutech_token') || localStorage.getItem('eduloop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      localStorage.removeItem('edutech_token');
      localStorage.removeItem('edutech_user');
      localStorage.removeItem('eduloop_token');
      localStorage.removeItem('eduloop_user');
    }
    return Promise.reject(error);
  }
);

export default api;
