// This file detects the correct API URL for the current environment
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Production detection
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://property-rental-market.onrender.com/api/v1';
    }
  }
  return 'http://localhost:5000/api/v1';
};

export default getApiBaseUrl;