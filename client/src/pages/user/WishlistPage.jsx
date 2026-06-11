import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const WishlistPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setProperties(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
    setLoading(false);
  };

  const handleRemove = async (propertyId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/wishlist/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setProperties(properties.filter(p => p.id !== propertyId));
      }
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <h1>My Wishlist</h1>
        <p>Properties you've saved for later</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner"></div>
          <p>Loading wishlist...</p>
        </div>
      ) : properties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <span style={{ fontSize: '64px' }}>❤️</span>
          <h3>Your wishlist is empty</h3>
          <p>Start browsing and save properties you like</p>
          <button className="btn btn-primary" onClick={() => navigate('/properties')}>
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="properties-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {properties.map(property => (
            <div key={property.id} className="wishlist-card" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div onClick={() => navigate(`/property/${property.id}`)} style={{ cursor: 'pointer' }}>
                {property.images && property.images[0] ? (
                  <img src={property.images[0]} alt={property.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '200px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🏡</div>
                )}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>{property.title}</h3>
                  <p style={{ margin: '0 0 8px', color: '#64748b' }}>📍 {property.city}, {property.state}</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#2563eb', fontSize: '20px' }}>
                    ₹{Number(property.monthly_rent || 0).toLocaleString()}<span style={{ fontSize: '14px', fontWeight: 'normal', color: '#64748b' }}>/mo</span>
                  </p>
                </div>
              </div>
              <div style={{ padding: '0 16px 16px', display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/property/${property.id}`)}>
                  View Details
                </button>
                <button className="btn btn-secondary" onClick={() => handleRemove(property.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;