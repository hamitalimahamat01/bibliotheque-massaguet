import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
};

// ===== BOOKS =====
export const booksApi = {
  getAll: (params?: any) => api.get('/books', { params }),
  getById: (id: string) => api.get(`/books/${id}`),
  create: (data: FormData) =>
    api.post('/books', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: any) => api.put(`/books/${id}`, data),
  delete: (id: string) => api.delete(`/books/${id}`),
  download: (id: string) => api.get(`/books/${id}/download`),
};

// ===== CATEGORIES =====
export const categoriesApi = {
  getAll: () => api.get('/categories'),
};

// ===== STATS =====
export const statsApi = {
  getStats: () => api.get('/documents/stats'),
};

export default api;
