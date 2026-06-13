import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) {
        try {
          const result = await authService.verifyToken(savedToken);
          if (result.success && result.user) {
            setUser(result.user);
            setToken(savedToken);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('auth_token');
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
          }
        } catch (err) {
          localStorage.removeItem('auth_token');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setUser(result.user);
        setToken(result.token);
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', result.token);
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const result = await authService.register({
        name: userData.name || userData.full_name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
      });

      if (result.success) {
        setUser(result.user);
        setToken(result.token);
        setIsAuthenticated(true);
        if (result.token) {
          localStorage.setItem('auth_token', result.token);
        }
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
    }
  };

  // Update profile function
  const updateProfile = async (updates) => {
    try {
      const result = await authService.updateProfile(token, updates);
      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Get authorization header
  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    isAdmin,
    getAuthHeader,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;