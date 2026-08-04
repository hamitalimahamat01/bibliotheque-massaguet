'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatar?: string;
  documents_count?: number;
  first_name?: string;
  last_name?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  updateProfile: (data: { name?: string; bio?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          const response = await authApi.getProfile();
          if (response.data?.success && response.data?.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          console.error('❌ Erreur chargement profil:', error);
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authApi.login({ email, password });
      
      if (response.data?.success) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        toast.success('Connexion réussie !');
      } else {
        toast.error('Erreur de connexion');
      }
    } catch (error: any) {
      console.error('❌ Erreur login:', error);
      const message = error.response?.data?.error || 'Erreur de connexion';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authApi.register({ name, email, password });
      
      if (response.data?.success) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        toast.success('Inscription réussie !');
      } else {
        toast.error('Erreur d\'inscription');
      }
    } catch (error: any) {
      console.error('❌ Erreur register:', error);
      const message = error.response?.data?.error || 'Erreur d\'inscription';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Déconnexion réussie');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const updateProfile = async (data: { name?: string; bio?: string }) => {
    try {
      const response = await authApi.updateProfile(data);
      if (response.data?.success && response.data?.user) {
        updateUser(response.data.user);
        toast.success('Profil mis à jour !');
      }
    } catch (error: any) {
      console.error('❌ Erreur update profile:', error);
      const message = error.response?.data?.error || 'Erreur lors de la mise à jour';
      toast.error(message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, updateProfile }}>
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
