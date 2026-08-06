import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = async () => {
    try {
      const { data } = await api.get('/users/me');
      setUser(data.data.user);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      await refetchUser();
      setIsLoading(false);
    };
    init();
  }, []);

  const setAuthUser = (userData) => setUser(userData);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const logoutAllDevices = async () => {
    try {
      await api.post('/auth/logout-all');
    } finally {
      setUser(null);
    }
  };

  const value = {
    user, isLoading, isAuthenticated: !!user,
    setAuthUser, refetchUser, logout, logoutAllDevices,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};