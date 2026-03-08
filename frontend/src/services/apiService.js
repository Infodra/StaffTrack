import api from './api';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Register company
  registerCompany: async (data) => {
    const response = await api.post('/auth/register-company', data);
    return response.data;
  }
};

export const employeeService = {
  // Get all employees
  getEmployees: async (params = {}) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  // Get employee by ID
  getEmployeeById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Create employee
  createEmployee: async (data) => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  // Update employee
  updateEmployee: async (id, data) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  // Delete employee
  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};

export const attendanceService = {
  // Login
  login: async (latitude, longitude) => {
    const response = await api.post('/attendance/login', { latitude, longitude });
    return response.data;
  },

  // Logout
  logout: async (latitude, longitude) => {
    const response = await api.post('/attendance/logout', { latitude, longitude });
    return response.data;
  },

  // Get attendance history
  getHistory: async (params = {}) => {
    const response = await api.get('/attendance/history', { params });
    return response.data;
  },

  // Get today's status
  getTodayStatus: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  // Get attendance report (admin only)
  getReport: async (params = {}) => {
    const response = await api.get('/attendance/report', { params });
    return response.data;
  }
};

export const companyService = {
  // Get company details
  getCompany: async () => {
    const response = await api.get('/company');
    return response.data;
  },

  // Update company settings
  updateSettings: async (data) => {
    const response = await api.put('/company/settings', data);
    return response.data;
  },

  // Get company stats
  getStats: async () => {
    const response = await api.get('/company/stats');
    return response.data;
  }
};
