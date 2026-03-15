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
  login: async (latitude, longitude, accuracy) => {
    const response = await api.post('/attendance/login', { latitude, longitude, accuracy });
    return response.data;
  },

  // Logout
  logout: async (latitude, longitude, accuracy) => {
    const response = await api.post('/attendance/logout', { latitude, longitude, accuracy });
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
  },

  // Admin: Update attendance record
  adminUpdate: async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },

  // Admin: Create attendance record
  adminCreate: async (data) => {
    const response = await api.post('/attendance/admin-create', data);
    return response.data;
  },

  // Admin: Export attendance as Excel
  exportExcel: async (params = {}) => {
    const response = await api.get('/attendance/export', {
      params,
      responseType: 'blob'
    });
    return response;
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

export const leaveService = {
  // Apply for leave
  applyLeave: async (data) => {
    const response = await api.post('/leave/apply', data);
    return response.data;
  },

  // Get leave requests
  getLeaveRequests: async (params = {}) => {
    const response = await api.get('/leave/requests', { params });
    return response.data;
  },

  // Get leave balance
  getLeaveBalance: async () => {
    const response = await api.get('/leave/balance');
    return response.data;
  },

  // Update leave status (admin)
  updateLeaveStatus: async (id, status, admin_remarks) => {
    const response = await api.put(`/leave/${id}/status`, { status, admin_remarks });
    return response.data;
  },

  // Delete leave request
  deleteLeaveRequest: async (id) => {
    const response = await api.delete(`/leave/${id}`);
    return response.data;
  },

  // Get leave statistics (admin)
  getLeaveStatistics: async () => {
    const response = await api.get('/leave/statistics');
    return response.data;
  },

  // Export leave data as Excel (admin)
  exportExcel: async (params = {}) => {
    const response = await api.get('/leave/export', { params, responseType: 'blob' });
    return response;
  }
};

export const superAdminService = {
  // Get platform stats
  getStats: async () => {
    const response = await api.get('/super-admin/stats');
    return response.data;
  },

  // Get all companies
  getCompanies: async (params = {}) => {
    const response = await api.get('/super-admin/companies', { params });
    return response.data;
  },

  // Get company details
  getCompanyDetails: async (companyId) => {
    const response = await api.get(`/super-admin/companies/${companyId}`);
    return response.data;
  },

  // Create company with admin
  createCompany: async (data) => {
    const response = await api.post('/super-admin/companies', data);
    return response.data;
  },

  // Update company
  updateCompany: async (companyId, data) => {
    const response = await api.put(`/super-admin/companies/${companyId}`, data);
    return response.data;
  },

  // Delete company
  deleteCompany: async (companyId) => {
    const response = await api.delete(`/super-admin/companies/${companyId}`);
    return response.data;
  }
};
