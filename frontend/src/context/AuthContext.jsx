import { createContext, useState, useEffect, useContext } from 'react';
import { getMe } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('messmate_token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await getMe();
        setUser(data.data.user);
      } catch (error) {
        localStorage.removeItem('messmate_token');
        localStorage.removeItem('messmate_user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginUser = (userData, token) => {
    localStorage.setItem('messmate_token', token);
    localStorage.setItem('messmate_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('messmate_token');
    localStorage.removeItem('messmate_user');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginUser,
    logoutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};