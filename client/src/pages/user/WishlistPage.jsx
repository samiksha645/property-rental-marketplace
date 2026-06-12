import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { wishlistService } from '../../services/api';
import PropertyCard from '../../components/property/PropertyCard';

const WishlistPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      if (!token) {
        setLoading(false);
        return;
      }
      const result = await wishlistService.getWishlist(token);
      if (result.success) {
        setWishlistItems(result.wishlist || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
    setLoading(false);
  };

  const handleRemove = async (propertyId) => {
    if (!token) return;
    try {
      const result = await wishlistService.removeFromWishlist(token, propertyId);
      if (result.success) {
        setWishlistItems(prev => prev.filter(item => Number(item.property_id) !== Number(propertyId) && Number(item.id) !== Number(propertyId)));
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
        <p style={{ marginTop: '16px', color: '#64748b' }}>Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a', marginBottom: '8px' }}>My Wishlist</h1>
        <p style={{ color: '#64748b' }}>{wishlistItems.length} saved {wishlistItems.length === 1 ? 'property' : 'properties'}</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❤️</div>
          <h3 style={{ color: '#0f172a', marginBottom: '8px', fontSize: '1.25rem' }}>Your wishlist is empty</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Save properties you like to find them later</p>
          <button className="btn btn-primary" onClick={() => navigate('/properties')}>
            Browse Properties
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {wishlistItems.map(item => {
            // The wishlist query returns property fields directly from the JOIN
            const propertyData = {
              id: item.property_id || item.id,
              title: item.title || 'Property',
              city: item.city || '',
              locality: item.locality || '',
              state: item.state || '',
              property_type: item.property_type || '',
              bedrooms: item.bedrooms || 0,
              bathrooms: item.bathrooms || 0,
              monthly_rent: item.monthly_rent || 0,
              maintenance: item.maintenance || 0,
              security_deposit: item.security_deposit || 0,
              furnishing: item.furnishing || '',
              parking: item.parking || '',
              area_sqft: item.area_sqft || 0,
              images: item.images || [],
              is_verified: item.is_verified || false,
              is_featured: item.is_featured || false,
              pet_friendly: item.pet_friendly || false,
            };

            return (
              <div key={item.id} style={{ position: 'relative' }}>
                <PropertyCard 
                  property={propertyData} 
                  onPropertyClick={handlePropertyClick}
                />
                <button
                  onClick={() => handleRemove(propertyData.id)}
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
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={(e) => e.target.style.background = '#ef4444'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.9)'}
                >
                  ✕ Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;