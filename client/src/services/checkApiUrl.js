// This file detects the correct API URL for the current environment
// In production, it uses the deployed backend URL
// In development, it uses localhost:5000

const getApiBaseUrl = () => {
  // Check if running on Render or production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Production detection
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // You're on the live site - update this to your actual Render backend URL
      return 'https://property-rental-marketplace-3wo7.onrender.com/api/v1';
    }
  }
  return 'http://localhost:5000/api/v1';
};

export default getApiBaseUrl;