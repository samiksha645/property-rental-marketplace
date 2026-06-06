// Auth API Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://property-rental-marketplace-3wo7.onrender.com/api/v1';

// Helper function for handling fetch responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  return response.json();
};

// Auth Service
export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        user: data.data.user,
        token: data.data.token,
        message: data.message,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message,
        user: null,
        token: null,
      };
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        user: data.data.user,
        token: data.data.token,
        message: data.message,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message,
        user: null,
        token: null,
      };
    }
  },

  // Get user profile
  getProfile: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        user: data.data,
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.message,
        user: null,
      };
    }
  },

  // Update user profile
  updateProfile: async (token, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        user: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message,
        user: null,
      };
    }
  },

  // Update password
  updatePassword: async (token, passwordData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Logout
  logout: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      await handleResponse(response);
      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Verify token
  verifyToken: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        user: data.data.user,
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        error: error.message,
        user: null,
      };
    }
  },
};

// Admin Service
export const adminService = {
  // Get dashboard stats
  getDashboardStats: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        stats: data.data.stats,
        recentBookings: data.data.recentBookings,
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return {
        success: false,
        error: error.message,
        stats: null,
        recentBookings: [],
      };
    }
  },

  // Get all users
  getAllUsers: async (token, page = 1, limit = 50, search = '') => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      
      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        users: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Get users error:', error);
      return {
        success: false,
        error: error.message,
        users: [],
        pagination: null,
      };
    }
  },

  // Delete user
  deleteUser: async (token, userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error('Delete user error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get all properties (admin view)
  getAllProperties: async (token, page = 1, limit = 50) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        properties: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Get properties error:', error);
      return {
        success: false,
        error: error.message,
        properties: [],
        pagination: null,
      };
    }
  },

  // Create property (admin)
  createProperty: async (token, propertyData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(propertyData),
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        property: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error('Create property error:', error);
      return {
        success: false,
        error: error.message,
        property: null,
      };
    }
  },

  // Update property (admin)
  updateProperty: async (token, propertyId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        property: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error('Update property error:', error);
      return {
        success: false,
        error: error.message,
        property: null,
      };
    }
  },

  // Delete property (admin)
  deleteProperty: async (token, propertyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error('Delete property error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get all bookings
  getAllBookings: async (token, page = 1, limit = 50, status = '') => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      
      const response = await fetch(`${API_BASE_URL}/admin/bookings?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        bookings: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Get bookings error:', error);
      return {
        success: false,
        error: error.message,
        bookings: [],
        pagination: null,
      };
    }
  },

  // Update booking status
  updateBookingStatus: async (token, bookingId, status, cancellationReason = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, cancellation_reason: cancellationReason }),
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        booking: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error('Update booking status error:', error);
      return {
        success: false,
        error: error.message,
        booking: null,
      };
    }
  },
};