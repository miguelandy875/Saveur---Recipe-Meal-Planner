import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '../types';
import { apiFetch, clearSession, getStoredSession, saveSession } from './api';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getStoredSession();

    if (!session) {
      setLoading(false);
      return;
    }

    setUser(session.user);
    apiFetch<{ user: AuthUser }>('/auth/me')
      .then((response) => {
        saveSession({ token: session.token, user: response.user });
        setUser(response.user);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveSession(response);
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    saveSession(response);
    setUser(response.user);
  };

  const logout = async () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
