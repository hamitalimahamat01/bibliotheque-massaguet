import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  logout: (data?: { refreshToken: string }) =>
    api.post('/auth/logout', data || {}),
};

// API Books
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

// API Categories - avec fallback statique
export const categoriesApi = {
  getAll: async () => {
    try {
      const response = await api.get('/categories');
      return response;
    } catch (error) {
      // Fallback statique en cas d'erreur
      console.warn('Utilisation des catégories statiques');
      return {
        data: {
          success: true,
          categories: [
            { id: '1', name: 'Mathématiques' },
            { id: '2', name: 'Physique' },
            { id: '3', name: 'Chimie' },
            { id: '4', name: 'Anglais' },
            { id: '5', name: 'Philosophie' },
            { id: '6', name: 'Histoire' }
          ]
        }
      };
    }
  },
  create: (data: any) => api.post('/categories', data),
};

// API Users
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
};

// API Stats
export const statsApi = {
  getStats: () => api.get('/documents/stats'),
};

export default api;
  toggleFavorite: (id: string) => api.post(`/books/${id}/favorite`),
