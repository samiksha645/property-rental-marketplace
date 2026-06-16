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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Log which auth backend we're using (for debugging)
  console.log('🔐 AuthProvider initializing - using CUSTOM authService (not Supabase)');

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      // Clear any leftover Supabase session data from localStorage
      const supabaseKeys = Object.keys(localStorage).filter(k => k.startsWith('sb-'));
      supabaseKeys.forEach(k => {
        console.log('🧹 Clearing old Supabase localStorage key:', k);
        localStorage.removeItem(k);
      });

      const savedToken = localStorage.getItem('auth_token');
      console.log('🔐 initAuth: savedToken found?', !!savedToken);

      if (savedToken) {
        try {
          console.log('🔐 initAuth: verifying token...');
          const result = await authService.verifyToken(savedToken);
          console.log('🔐 initAuth: verify result:', result);

          if (result.success && result.user) {
            setUser(result.user);
            setToken(savedToken);
            setIsAuthenticated(true);
            console.log('🔐 initAuth: token valid, user restored:', result.user.email);
          } else {
            console.log('🔐 initAuth: token invalid, clearing storage');
            localStorage.removeItem('auth_token');
          }
        } catch (err) {
          console.error('🔐 initAuth: token verification failed:', err.message);
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
      console.log('🔐 initAuth: complete, loading=false');
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    console.log('🔐 login() called with email:', email);
    console.log('🔐 login: API_BASE_URL =', authService.API_BASE_URL || 'unknown');

    try {
      const result = await authService.login(email, password);
      console.log('🔐 login result:', result);

      if (result.success) {
        setUser(result.user);
        setToken(result.token);
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', result.token);
        console.log('🔐 login: SUCCESS, token saved to localStorage');
        return { success: true, user: result.user };
      }
      console.log('🔐 login: FAILED -', result.error);
      return { success: false, error: result.error || 'Login failed' };
    } catch (error) {
      console.error('🔐 login: EXCEPTION:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  // Register function
  const register = async (userData) => {
    console.log('🔐 register() called with email:', userData.email);
    console.log('🔐 register: API_BASE_URL =', authService.API_BASE_URL || 'unknown');

    try {
      const registerData = {
        name: userData.name || userData.full_name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
      };
      console.log('🔐 register: sending data:', registerData);

      const result = await authService.register(registerData);
      console.log('🔐 register result:', result);

      if (result.success) {
        setUser(result.user);
        setToken(result.token);
        setIsAuthenticated(true);
        if (result.token) {
          localStorage.setItem('auth_token', result.token);
        }
        console.log('🔐 register: SUCCESS');
        return { success: true, user: result.user };
      }
      console.log('🔐 register: FAILED -', result.error);
      return { success: false, error: result.error || 'Registration failed' };
    } catch (error) {
      console.error('🔐 register: EXCEPTION:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  // Logout function
  const logout = async () => {
    console.log('🔐 logout() called');
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
      console.log('🔐 logout: complete');
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