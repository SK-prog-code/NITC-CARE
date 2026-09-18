import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract error messages & handle 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Clear token if expired or unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if not already on login/register/home
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register' && path !== '/') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error.response.data || { message: error.message });
    }
    return Promise.reject({ message: 'Network error or server unavailable' });
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  getStaff: () => api.get('/auth/staff'),
  createUser: (userData) => api.post('/auth/create-user', userData),
};

// Complaint Services
export const complaintService = {
  getComplaints: (params) => api.get('/complaints', { params }),
  getComplaint: (id) => api.get(`/complaints/${id}`),
  createComplaint: (formData) =>
    api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  updateStatus: (id, payload) => api.patch(`/complaints/${id}/status`, payload),
  assignComplaint: (id, payload) => api.patch(`/complaints/${id}/assign`, payload),
  updatePriority: (id, payload) => api.patch(`/complaints/${id}/priority`, payload),
  addComment: (id, payload) => api.post(`/complaints/${id}/comments`, payload),
  reopenComplaint: (id, payload) => api.post(`/complaints/${id}/reopen`, payload),
};

// Category Services
export const categoryService = {
  getCategories: (params) => api.get('/categories', { params }),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Department Services
export const departmentService = {
  getDepartments: () => api.get('/departments'),
  getDepartment: (id) => api.get(`/departments/${id}`),
  createDepartment: (data) => api.post('/departments', data),
  updateDepartment: (id, data) => api.put(`/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),
};

// Stats Services (Admin)
export const statsService = {
  getSummary: () => api.get('/stats/summary'),
  getByCategory: () => api.get('/stats/by-category'),
  getByDepartment: () => api.get('/stats/by-department'),
  getByPriority: () => api.get('/stats/by-priority'),
  getByHostel: () => api.get('/stats/by-hostel'),
  getResolutionTime: () => api.get('/stats/resolution-time'),
};

export default api;
