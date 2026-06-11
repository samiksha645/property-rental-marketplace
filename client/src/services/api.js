// Base API configuration - supports local development and production
// For development: http://localhost:5000/api/v1
// For production: Render or other cloud provider
const getAPIBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect local development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api/v1';
  }
  
  // Production URL as fallback
  return 'https://property-rental-market.onrender.com/api/v1';
};

const API_BASE_URL = getAPIBaseURL();

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

// Generic fetch wrapper with timeout
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    throw error;
  }
};

// Property API Service
export const propertyService = {
  // Get all properties with optional filters
  getAllProperties: async (filters = {}, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/properties?${params}`);
      const data = await handleResponse(response);
      return {
        success: true,
        properties: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error fetching properties:', error);
      return {
        success: false,
        error: error.message,
        properties: [],
      };
    }
  },

  // Get featured properties
  getFeaturedProperties: async (limit = 6) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/properties/featured?limit=${limit}`);
      const data = await handleResponse(response);
      return {
        success: true,
        properties: data.data,
      };
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      return {
        success: false,
        error: error.message,
        properties: [],
      };
    }
  },

  // Search properties
  searchProperties: async (searchTerm, page = 1, limit = 20) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/properties/search?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`
      );
      const data = await handleResponse(response);
      return {
        success: true,
        properties: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error searching properties:', error);
      return {
        success: false,
        error: error.message,
        properties: [],
      };
    }
  },

  // Get single property by ID
  getPropertyById: async (id) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/properties/${id}`);
      const data = await handleResponse(response);
      return {
        success: true,
        property: data.data,
      };
    } catch (error) {
      console.error('Error fetching property:', error);
      return {
        success: false,
        error: error.message,
        property: null,
      };
    }
  },

  // Create new property (for landlords)
  createProperty: async (propertyData, authToken = null) => {
    try {
      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/properties`, {
        method: 'POST',
        headers,
        body: JSON.stringify(propertyData),
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        property: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error('Error creating property:', error);
      return {
        success: false,
        error: error.message,
        property: null,
      };
    }
  },

  // Update property status/details (Admin)
  updateProperty: async (propertyId, updates, authToken = null) => {
    try {
      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/properties/${propertyId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        property: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error('Error updating property:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Delete property (Admin)
  deleteProperty: async (propertyId, authToken = null) => {
    try {
      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/properties/${propertyId}`, {
        method: 'DELETE',
        headers,
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error('Error deleting property:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// Booking API Service
export const bookingService = {
  // Create a new booking
  createBooking: async (bookingData, authToken = null) => {
    try {
      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingData),
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        booking: data.data.booking,
        pricing: data.data.pricing,
        message: data.message,
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: error.message,
        booking: null,
      };
    }
  },

  // Check property availability
  checkAvailability: async (propertyId, checkInDate, checkOutDate) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/bookings/availability/${propertyId}?check_in_date=${checkInDate}&check_out_date=${checkOutDate}`
      );
      const data = await handleResponse(response);
      return {
        success: true,
        available: data.data.available,
        pricing: data.data.pricing,
      };
    } catch (error) {
      console.error('Error checking availability:', error);
      return {
        success: false,
        error: error.message,
        available: false,
      };
    }
  },

  // Get user's bookings
  getUserBookings: async (page = 1, limit = 20, authToken = null) => {
    try {
      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/bookings/my-bookings?page=${page}&limit=${limit}`,
        { headers }
      );
      const data = await handleResponse(response);
      return {
        success: true,
        bookings: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return {
        success: false,
        error: error.message,
        bookings: [],
      };
    }
  },

  // Get all bookings (Admin)
  getAllBookings: async (page = 1, limit = 50, authToken = null) => {
    try {
      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/bookings?page=${page}&limit=${limit}`,
        { headers }
      );
      const data = await handleResponse(response);
      return {
        success: true,
        bookings: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      return {
        success: false,
        error: error.message,
        bookings: [],
      };
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId, reason = null, authToken = null) => {
    try {
      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ reason }),
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        booking: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Confirm a booking (Admin)
  confirmBooking: async (bookingId, authToken = null) => {
    try {
      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/bookings/${bookingId}/confirm`, {
        method: 'PUT',
        headers,
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        booking: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error('Error confirming booking:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// Utility function for offline detection
export const isOnline = () => {
  return navigator.onLine;
};

// Health check endpoint
export const checkServerHealth = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL.replace('/api/v1', '')}/health`, {}, 5000);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    return false;
  }
};