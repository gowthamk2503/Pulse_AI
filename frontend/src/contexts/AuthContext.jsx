import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pulseai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('pulseai_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('pulseai_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.data);
          localStorage.setItem('pulseai_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn("Session expired or invalid, clearing credentials.");
          logout();
        }
      }
      setLoading(false);
    };
    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('pulseai_token', access_token);
    localStorage.setItem('pulseai_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (fullName, email, password) => {
    const res = await api.register({ full_name: fullName, email, password });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('pulseai_token', access_token);
    localStorage.setItem('pulseai_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pulseai_token');
    localStorage.removeItem('pulseai_user');
  };

  const updateProfile = async (data) => {
    const res = await api.updateProfile(data);
    setUser(res.data);
    localStorage.setItem('pulseai_user', JSON.stringify(res.data));
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
