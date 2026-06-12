import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PropertyCard from '../../components/property/PropertyCard';
import { API_BASE_URL } from '../../services/authService';

const WishlistPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setWishlistItems(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
    setLoading(false);
  };

  const handleRemove = async (propertyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setWishlistItems(wishlistItems.filter(item => item.property_id !== propertyId));
      }
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  const handlePropertyClick = (id) => {
    navigate(`/property/${id}`);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <h1>My Wishlist</h1>
        <p>{wishlistItems.length} saved properties</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>❤️</span>
          <h3>Your wishlist is empty</h3>
          <p>Save properties you like to find them later</p>
          <button className="btn btn-primary" onClick={() => navigate('/properties')}>
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="properties-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {wishlistItems.map(item => (
            <div key={item.id} style={{ position: 'relative' }}>
              <PropertyCard 
                property={item.property || item} 
                onPropertyClick={handlePropertyClick}
              />
              <button
                onClick={() => handleRemove(item.property_id || item.id)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  zIndex: 10,
                }}
              >
                ✕ Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;