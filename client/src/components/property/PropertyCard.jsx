import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { wishlistService } from '../../services/api';
import './PropertyCard.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

const formatPrice = (price) => {
  if (!price) return '₹0';
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(1)}K`;
  return `₹${price}`;
};

const PropertyCard = ({ property, onPropertyClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [isFav, setIsFav] = useState(property.is_wishlisted || false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const {
    id,
    title,
    city,
    locality,
    state,
    property_type,
    bedrooms,
    bathrooms,
    monthly_rent,
    maintenance,
    security_deposit,
    furnishing,
    parking,
    area_sqft,
    images,
    is_verified,
    is_featured,
    pet_friendly,
    description,
    owner_name,
    owner_phone
  } = property;

  useEffect(() => {
    const checkStatus = async () => {
      if (isAuthenticated && token && id) {
        const res = await wishlistService.isWishlisted(token, id);
        if (res.success) {
          setIsFav(res.is_wishlisted);
        }
      }
    };
    checkStatus();
  }, [id, isAuthenticated, token]);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isFav) {
        const res = await wishlistService.removeFromWishlist(token, id);
        if (res.success) setIsFav(false);
      } else {
        const res = await wishlistService.addToWishlist(token, id);
        if (res.success) setIsFav(true);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handleQuickViewClick = (e) => {
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const displayImage = images && images.length > 0 ? images[0] : null;

  const formatPropertyType = (type) => {
    if (!type) return '';
    return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <div className="property-card" onClick={() => onPropertyClick ? onPropertyClick(id) : navigate(`/property/${id}`)}>
        <div className="property-card-image-container">
          {displayImage && !imgError ? (
            <img 
              src={displayImage} 
              alt={title} 
              className="property-card-image"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="property-card-image-fallback">
              <img 
                src={FALLBACK_IMAGE}
                alt={title}
                className="property-card-image"
                loading="lazy"
                style={{ opacity: 0.8 }}
              />
            </div>
          )}
          
          <div className="property-card-badges">
            {is_featured && <span className="badge badge-featured">⭐ Featured</span>}
            {is_verified && <span className="badge badge-verified">✓ Verified</span>}
            {pet_friendly && <span className="badge badge-primary">🐾 Pet Friendly</span>}
          </div>

          <button 
            className={`property-card-fav-btn ${isFav ? 'active' : ''}`} 
            onClick={handleFavoriteClick}
            aria-label="Add to favorites"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 5,
              fontSize: '18px',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isFav ? '❤️' : '🤍'}
          </button>

          <div className="property-card-type">{formatPropertyType(property_type)}</div>
        </div>

        <div className="property-card-content">
          <div className="property-card-location">
            📍 {city}{locality ? `, ${locality}` : ''}
          </div>
          
          <h3 className="property-card-title">{title}</h3>
          
          <div className="property-card-specs">
            <span className="spec" title="Bedrooms">🛏️ {bedrooms} BHK</span>
            <span className="spec" title="Bathrooms">🚿 {bathrooms} Bath</span>
            {area_sqft && <span className="spec" title="Area">📐 {area_sqft} sqft</span>}
            <span className="spec" title="Furnishing">
              {furnishing === 'fully-furnished' ? '🪑 Fully' : furnishing === 'semi-furnished' ? '🪑 Semi' : '📦 Unfurnished'}
            </span>
          </div>

          <div className="property-card-divider"></div>

          <div className="property-card-footer">
            <div className="property-card-pricing">
              <span className="price-rent">{formatPrice(monthly_rent)}/mo</span>
              {security_deposit > 0 && (
                <span className="price-deposit">₹{Number(security_deposit).toLocaleString()} deposit</span>
              )}
            </div>
            <div className="property-card-actions" style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="quick-view-btn" 
                onClick={handleQuickViewClick}
                style={{
                  padding: '8px 12px',
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#475569',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
              >
                👁️ Quick View
              </button>
              <button className="view-details-btn">
                Details →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <div 
          className="quickview-overlay" 
          onClick={() => setIsQuickViewOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            className="quickview-modal" 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <button 
              className="quickview-close-btn" 
              onClick={() => setIsQuickViewOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 10,
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
            
            <div 
              className="quickview-content"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '0'
              }}
            >
              <div className="quickview-image-side" style={{ height: '350px', background: '#f1f5f9' }}>
                <img 
                  src={displayImage || FALLBACK_IMAGE} 
                  alt={title} 
                  className="quickview-image" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="quickview-details-side" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <span 
                    className="quickview-type-badge"
                    style={{
                      background: 'var(--primary-50)',
                      color: 'var(--primary)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}
                  >
                    {formatPropertyType(property_type)}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '8px', color: '#0f172a' }}>{title}</h2>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>📍 {locality ? `${locality}, ` : ''}{city}, {state}</p>
                </div>
                
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>{formatPrice(monthly_rent)}</span>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}> / month</span>
                  {maintenance > 0 && <span style={{ color: '#475569', fontSize: '0.813rem', marginLeft: '12px' }}>+ ₹{maintenance} Maintenance</span>}
                </div>

                <div 
                  className="quickview-specs"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    fontSize: '0.875rem',
                    color: '#475569'
                  }}
                >
                  <div><strong>Beds:</strong> {bedrooms} BHK</div>
                  <div><strong>Baths:</strong> {bathrooms}</div>
                  <div><strong>Super Area:</strong> {area_sqft || '—'} sqft</div>
                  <div><strong>Furnishing:</strong> {furnishing?.replace('-', ' ')}</div>
                  <div><strong>Parking:</strong> {parking?.replace('-', ' ')}</div>
                </div>

                <div className="quickview-desc">
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '6px' }}>Overview</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5', maxHeight: '80px', overflowY: 'auto' }}>
                    {description || 'No description provided.'}
                  </p>
                </div>

                <div className="quickview-owner" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '0.938rem', fontWeight: '600', marginBottom: '6px' }}>Landlord Details</h4>
                  <p style={{ fontSize: '0.875rem', color: '#475569' }}><strong>Name:</strong> {owner_name || 'Owner'}</p>
                  {isAuthenticated ? (
                    <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '4px' }}><strong>Contact:</strong> {owner_phone || 'Not Shared'}</p>
                  ) : (
                    <p style={{ fontStyle: 'italic', fontSize: '0.813rem', color: '#64748b', marginTop: '4px' }}>Please login to view contact details</p>
                  )}
                </div>

                <div className="quickview-actions" style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setIsQuickViewOpen(false);
                      onPropertyClick ? onPropertyClick(id) : navigate(`/property/${id}`);
                    }}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyCard;