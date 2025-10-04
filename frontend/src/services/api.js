import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD 
    ? 'https://faculty-management-2apo.vercel.app/api'  // Using the shorter domain for production
    : 'http://localhost:5000/api'),
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout to prevent hanging requests
  timeout: 15000 // 15 seconds (reduced from 30 seconds)
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