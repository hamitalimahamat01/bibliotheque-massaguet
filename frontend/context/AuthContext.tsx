'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface User {
  id: string | number;
  name: string;
  email: string;
  role?: string;
  bio?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  city?: string;
  birthDate?: string;
  documentsCount?: number;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  googleLogin: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Gestion de l'utilisateur depuis le token JWT ou la session NextAuth
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (session?.user) {
      // Connexion Google via NextAuth
      setUser({
        id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        avatar: session.user.image || '',
        provider: 'google',
        isAuthenticated: true,
      } as any);
      setIsLoading(false);
      return;
    }

    if (token) {
      // Connexion email/password via notre backend
      fetchProfile(token);
    } else {
      setIsLoading(false);
    }
  }, [session, status]);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser({ ...data.user, provider: 'email' });
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      localStorage.setItem('token', data.token);
      setUser({ ...data.user, provider: 'email' });
      toast.success('Connexion réussie !');
      router.push('/profile/complete');
    } catch (error: any) {
      toast.error(error.message || 'Erreur de connexion');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur d\'inscription');
      }

      localStorage.setItem('token', data.token);
      setUser({ ...data.user, provider: 'email' });
      toast.success('Inscription réussie !');
      router.push('/profile/complete');
    } catch (error: any) {
      toast.error(error.message || 'Erreur d\'inscription');
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      await signIn('google', {
        callbackUrl: '/profile/complete',
        redirect: true,
      });
    } catch (error) {
      console.error('Erreur Google:', error);
      toast.error('Erreur lors de la connexion avec Google');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    signOut({ redirect: false });
    toast.success('Déconnexion réussie');
    router.push('/login');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur de mise à jour');
      }

      setUser({ ...result.user, provider: 'email' });
      toast.success('Profil mis à jour');
    } catch (error: any) {
      toast.error(error.message || 'Erreur de mise à jour');
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
        googleLogin,
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
