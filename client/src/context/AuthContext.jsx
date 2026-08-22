import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';
import { initSocket, disconnectSocket } from '../api/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('qp_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('qp_token'));

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('qp_token', newToken);
    localStorage.setItem('qp_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    // Initialize socket connection
    initSocket(newToken);

    return newUser;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data);
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('qp_token', newToken);
    localStorage.setItem('qp_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    initSocket(newToken);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('qp_token');
    localStorage.removeItem('qp_user');
    setToken(null);
    setUser(null);
    disconnectSocket();
    window.location.href = '/login';
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
