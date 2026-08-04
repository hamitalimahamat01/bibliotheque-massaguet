import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bibliotheque-backend-wfkn.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
};

export const booksApi = {
  getAll: (params?: any) => api.get('/books', { params }),
  getById: (id: string) => api.get(`/books/${id}`),
  create: (data: FormData) =>
    api.post('/books', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // 🔥 Mise à jour
  update: (id: string, data: any) => api.put(`/books/${id}`, data),
  // 🔥 Suppression
  delete: (id: string) => api.delete(`/books/${id}`),
  download: (id: string) => api.get(`/books/${id}/download`),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
};

export const statsApi = {
  getStats: () => api.get('/documents/stats'),
};

export default api;
