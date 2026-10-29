import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('cinebook_user') || 'null');
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => (localStorage.getItem('cinebook_token') ? readStoredUser() : null));
  const [token, setToken] = useState(() => localStorage.getItem('cinebook_token'));
  // `loading` stays true until the stored session has been verified - guards must wait for it
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('cinebook_token')));

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      if (!localStorage.getItem('cinebook_token')) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        if (!cancelled && res.user) {
          setUser(res.user);
          localStorage.setItem('cinebook_user', JSON.stringify(res.user));
        }
      } catch (err) {
        // Only drop the session when the server says it is invalid, not on a flaky network
        if (!cancelled && (err.status === 401 || err.status === 404)) {
          authService.logout();
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('cinebook:unauthorized', handleUnauthorized);
    verifySession();
    return () => {
      cancelled = true;
      window.removeEventListener('cinebook:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  const register = useCallback(async (userData) => {
    const res = await authService.register(userData);
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('cinebook_user', JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isAdmin: Boolean(user && user.role === 'admin'),
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
