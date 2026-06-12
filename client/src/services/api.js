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
  // Handle empty responses gracefully
  const contentType = response.headers.get('content-type');
  
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return {};
  }
  
  let data;
  try {
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return {};
    }
    data = JSON.parse(text);
  } catch (parseError) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return {};
  }
  
  if (!response.ok) {
    const error = new Error(data.message || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
};

// Create an AbortController-compatible timeout
const createTimeoutSignal = (timeoutMs) => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
};

// Generic fetch wrapper with timeout
const fetchWithTimeout = async (url, options = {}, timeout = 15000) => {
  const signal = createTimeoutSignal(timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

// Helper to extract data array from API response
// Server returns { success: true, data: [...], pagination: {...} }
// Client expects properties/bookings/etc array
const extractData = (response, field = 'data') => {
  if (!response.success) return [];
  // Server wraps array in response.data
  if (Array.isArray(response.data)) return response.data;
  // Server wraps in response[field]
  if (Array.isArray(response[field])) return response[field];
  // Single object - wrap in array
  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    // Check if there's a nested array like response.data.properties
    for (const key of ['properties', 'bookings', 'users', 'reviews', 'categories', 'cities']) {
      if (Array.isArray(response.data[key])) return response.data[key];
    }
    return [response.data];
  }
  return [];
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
        properties: extractData(data),
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
        properties: extractData(data),
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
        properties: extractData(data),
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
        property: data.data || null,
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
        booking: data.data?.booking || data.data,
        pricing: data.data?.pricing,
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
        available: data.data?.available ?? true,
        pricing: data.data?.pricing,
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
        bookings: extractData(data),
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
        bookings: extractData(data),
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

// Wishlist Service
export const wishlistService = {
  // Get user's wishlist
  getWishlist: async (authToken, page = 1, limit = 20) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/wishlist?page=${page}&limit=${limit}`,
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );
      const data = await handleResponse(response);
      return {
        success: true,
        wishlist: extractData(data),
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return { success: false, error: error.message, wishlist: [] };
    }
  },

  // Add to wishlist
  addToWishlist: async (authToken, propertyId) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ property_id: parseInt(propertyId) }),
      });
      const data = await handleResponse(response);
      return { success: true, data: data.data, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (authToken, propertyId) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/wishlist/${propertyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      const data = await handleResponse(response);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Check if property is wishlisted
  isWishlisted: async (authToken, propertyId) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/wishlist/check/${propertyId}`,
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );
      const data = await handleResponse(response);
      return { success: true, is_wishlisted: data.data?.is_wishlisted || false };
    } catch (error) {
      return { success: false, is_wishlisted: false, error: error.message };
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