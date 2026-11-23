import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('phishshield_user');
      const token = localStorage.getItem('phishshield_token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to load user session", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const loggedUser = await api.login(username, password);
    setUser(loggedUser);
    setIsAuthModalOpen(false);
    return loggedUser;
  };

  const register = async (username, email, password) => {
    const newUser = await api.register(username, email, password);
    setUser(newUser);
    setIsAuthModalOpen(false);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('phishshield_token');
    localStorage.removeItem('phishshield_user');
    setUser(null);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthModalOpen,
      authMode,
      setAuthMode,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
