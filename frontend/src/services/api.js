import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://https://faculty-management-hsdq.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout to prevent hanging requests
  timeout: 30000 // 30 seconds (increased from 15 seconds for better reliability)
});

// Request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Remove token from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page or show auth error
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;