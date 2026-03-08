import axios from 'axios';
import { getTenantFromHostname } from '../utils/helpers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token and company header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add X-Company-ID header for development mode (localhost)
    const hostname = window.location.hostname;
    const tenant = getTenantFromHostname();
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      // For localhost, always send default company ID
      if (!config.headers['X-Company-ID']) {
        // Try to get from user data first
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          if (user?.company?.company_id) {
            config.headers['X-Company-ID'] = user.company.company_id;
          } else {
            // Default to TECINFO for development
            config.headers['X-Company-ID'] = 'TECINFO';
          }
        } catch (e) {
          // If no user data, use default
          config.headers['X-Company-ID'] = 'TECINFO';
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
