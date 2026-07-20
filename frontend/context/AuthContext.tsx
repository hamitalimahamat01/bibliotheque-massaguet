'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatar?: string;
  documentsCount?: number;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier la session au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.getProfile()
        .then((res: any) => {
          setUser(res.data.user);
        })
        .catch((error) => {
          console.error('Erreur chargement profil:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Connexion
  const login = async (email: string, password: string) => {
    try {
      const res: any = await authApi.login({ email, password });
      
      // Stocker les tokens
      localStorage.setItem('token', res.data.accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem('refreshToken', res.data.refreshToken);
      }
      
      setUser(res.data.user);
      toast.success('Connexion réussie !');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erreur de connexion';
      toast.error(message);
      throw error;
    }
  };

  // Inscription
  const register = async (name: string, email: string, password: string) => {
    try {
      const res: any = await authApi.register({ name, email, password });
      
      // Stocker les tokens
      localStorage.setItem('token', res.data.accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem('refreshToken', res.data.refreshToken);
      }
      
      setUser(res.data.user);
      toast.success('Inscription réussie !');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erreur d\'inscription';
      toast.error(message);
      throw error;
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      toast.success('Déconnexion réussie');
    }
  };

  // Mise à jour du profil
  const updateProfile = async (data: Partial<User>) => {
    try {
      const res: any = await authApi.updateProfile(data);
      setUser(res.data.user);
      toast.success('Profil mis à jour');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erreur de mise à jour';
      toast.error(message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
