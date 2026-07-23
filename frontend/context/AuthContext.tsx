'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
  provider?: string;
  isAuthenticated?: boolean;
  firstName?: string;
  lastName?: string;
  gender?: string;
  city?: string;
  birthDate?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (session?.user) {
      // Utiliser une assertion de type pour les propriétés supplémentaires
      const sessionUser = session.user as any;
      setUser({
        id: sessionUser.id || sessionUser.sub || '',
        name: sessionUser.name || '',
        email: sessionUser.email || '',
        image: sessionUser.image || '',
        role: sessionUser.role || 'USER',
        provider: sessionUser.provider || 'google',
        isAuthenticated: true,
      });
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [session, status]);

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Email ou mot de passe incorrect');
        throw new Error(result.error);
      }

      toast.success('Connexion réussie !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur de connexion');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res: any = await authApi.register({ name, email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Inscription réussie !');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur d\'inscription');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const res: any = await authApi.updateProfile(data);
      setUser(res.data.user);
      toast.success('Profil mis à jour');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur de mise à jour');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        setUser,
      }}
    >
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
