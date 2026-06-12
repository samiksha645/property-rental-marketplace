const getAPIBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api/v1';
  }
  return 'https://property-rental-market.onrender.com/api/v1';
};

export const API_BASE_URL = getAPIBaseURL();

// Helper function for handling fetch responses with robust error handling
const handleResponse = async (response) => {
  // Check if response has content
  const contentType = response.headers.get('content-type');
  
  // For 204 No Content or empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return { success: true };
  }
  
  let data;
  try {
    // Try to parse JSON, if fails handle gracefully
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { success: true };
    }
    data = JSON.parse(text);
  } catch (parseError) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { success: true };
  }

  if (!response.ok) {
    const error = new Error(data.message || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
};

// Auth Service
export const authService = {
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await handleResponse(response);
      return { success: true, user: data.data?.user, token: data.data?.token, message: data.message };
    } catch (error) {
      return { success: false, error: error.message, user: null, token: null };
    }
  },

  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(response);
      return { success: true, user: data.data?.user, token: data.data?.token, message: data.message };
    } catch (error) {
      return { success: false, error: error.message, user: null, token: null };
    }
  },

  getProfile: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await handleResponse(response);
      return { success: true, user: data.data };
    } catch (error) {
      return { success: false, error: error.message, user: null };
    }
  },

  updateProfile: async (token, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      const data = await handleResponse(response);
      return { success: true, user: data.data, message: data.message };
    } catch (error) {
      return { success: false, error: error.message, user: null };
    }
  },

  updatePassword: async (token, passwordData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(passwordData),
      });
      const data = await handleResponse(response);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logout: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      await handleResponse(response);
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  verifyToken: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await handleResponse(response);
      return { success: true, user: data.data?.user };
    } catch (error) {
      return { success: false, error: error.message, user: null };
    }
  },
};

// Admin Service
export const adminService = {
  getDashboardStats: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await handleResponse(response);
      return { success: true, stats: data.data?.stats, recentBookings: data.data?.recentBookings || [] };
    } catch (error) {
      return { success: false, error: error.message, stats: null, recentBookings: [] };
    }
  },

  getAllUsers: async (token, page = 1, limit = 50, search = '') => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await handleResponse(response);
      return { success: true, users: data.data || [], pagination: data.pagination };
    } catch (error) {
      return { success: false, error: error.message, users: [], pagination: null };
    }
  },

  deleteUser: async (token, userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await handleResponse(response);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  toggleUserStatus: async (token, userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await handleResponse(response);
      return { success: true, message: data.message, is_active: data.is_active };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getAllProperties: async (token, page = 1, limit = 50) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await handleResponse(response);
      return { success: true, properties: data.data || [], pagination: data.pagination };
    } catch (error) {
      return { success: false, error: error.message, properties: [], pagination: null };
    }
  },

  createProperty: async (token, propertyData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(propertyData),
      });
      const data = await handleResponse(response);
      return { success: true, property: data.data, message: data.message };
    } catch (error) {
      return { success: false, error: error.message, property: null };
    }
  },

  updateProperty: async (token, propertyId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      const data = await handleResponse(response);
      return { success: true, property: data.data, message: data.message };
    } catch (error) {
      return { success: false, error: error.message, property: null };
    }
  },

  deleteProperty: async (token, propertyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties/${propertyId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await handleResponse(response);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getAllBookings: async (token, page = 1, limit = 50, status = '') => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      const response = await fetch(`${API_BASE_URL}/admin/bookings?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await handleResponse(response);
      return { success: true, bookings: data.data || [], pagination: data.pagination };
    } catch (error) {
      return { success: false, error: error.message, bookings: [], pagination: null };
    }
  },

  updateBookingStatus: async (token, bookingId, status, cancellationReason = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, cancellation_reason: cancellationReason }),
      });
      const data = await handleResponse(response);
      return { success: true, booking: data.data, message: data.message };
    } catch (error) {
      return { success: false, error: error.message, booking: null };
    }
  },

  getAllReviews: async (token, page = 1, limit = 50) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reviews?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await handleResponse(response);
      return { success: true, reviews: data.data || [], pagination: data.pagination };
    } catch (error) {
      return { success: false, error: error.message, reviews: [] };
    }
  },

  deleteReview: async (token, reviewId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await handleResponse(response);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  createCategory: async (token, categoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(categoryData),
      });
      const data = await handleResponse(response);
      return { success: true, category: data.data, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateCategory: async (token, id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      const data = await handleResponse(response);
      return { success: true, category: data.data, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteCategory: async (token, id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await handleResponse(response);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  createCity: async (token, cityData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(cityData),
      });
      const data = await handleResponse(response);
      return { success: true, city: data.data, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateCity: async (token, id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/cities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      const data = await handleResponse(response);
      return { success: true, city: data.data, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteCity: async (token, id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/cities/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await handleResponse(response);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};