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
    
    // Add X-Company-ID header for all requests
    const hostname = window.location.hostname;
    const tenant = getTenantFromHostname();
    
    // Always send company ID header (for API domain routing)
    if (tenant) {
      config.headers['X-Company-ID'] = tenant.toUpperCase();
    } else if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      // For localhost, try to get from user data
      if (!config.headers['X-Company-ID']) {
        try {
          const userData = JSON.parse(localStorage.getItem('user'));
          const companyData = JSON.parse(localStorage.getItem('company'));
          // Super admin doesn't need X-Company-ID for super-admin routes
          if (userData?.role === 'super_admin') {
            if (companyData?.company_id) {
              config.headers['X-Company-ID'] = companyData.company_id;
            }
          } else if (companyData?.company_id) {
            config.headers['X-Company-ID'] = companyData.company_id;
          }
        } catch (e) {
          // No stored user data; don't set header
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
