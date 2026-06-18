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

// SVG Icons
const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : '#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const LocationIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a8a9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const VerifiedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const BedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5a5a6e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </svg>
);

const BathIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5a5a6e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z" />
    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25" />
    <path d="M4 21l1-1.5" />
    <path d="M20 21l-1-1.5" />
  </svg>
);

const AreaIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5a5a6e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

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
        try {
          const res = await wishlistService.isWishlisted(token, id);
          if (res.success) {
            setIsFav(res.is_wishlisted);
          }
        } catch (err) {
          // silently fail
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

  const handleCardClick = () => {
    if (onPropertyClick) {
      onPropertyClick(id);
    } else {
      navigate(`/property/${id}`);
    }
  };

  return (
    <>
      <div className="property-card" onClick={handleCardClick}>
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
          
          {/* Featured Badge */}
          {is_featured && !is_verified && (
            <span className="property-card-featured">⭐ Featured</span>
          )}
          
          {/* Verified Badge */}
          {is_verified && (
            <span className="property-card-verified-badge">
              <VerifiedIcon /> Verified
            </span>
          )}

          {/* Favorite Button */}
          <button 
            className={`property-card-fav-btn ${isFav ? 'active' : ''}`} 
            onClick={handleFavoriteClick}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon filled={isFav} />
          </button>

          {/* Property Type Badge */}
          <span className="property-card-type">{formatPropertyType(property_type)}</span>
        </div>

        <div className="property-card-content">
          <div className="property-card-location">
            <LocationIcon />
            {city}{locality ? `, ${locality}` : ''}
          </div>
          
          <h3 className="property-card-title">{title}</h3>
          
          <div className="property-card-specs">
            <span className="spec" title="Bedrooms">
              <span className="spec-icon"><BedIcon /></span> {bedrooms} BHK
            </span>
            <span className="spec" title="Bathrooms">
              <span className="spec-icon"><BathIcon /></span> {bathrooms} Bath
            </span>
            {area_sqft && (
              <span className="spec" title="Area">
                <span className="spec-icon"><AreaIcon /></span> {area_sqft} sqft
              </span>
            )}
          </div>

          <div className="property-card-divider"></div>

          <div className="property-card-footer">
            <div className="property-card-pricing">
              <span className="price-rent">{formatPrice(monthly_rent)}<span>/mo</span></span>
              {security_deposit > 0 && (
                <span className="price-deposit">₹{Number(security_deposit).toLocaleString()} deposit</span>
              )}
            </div>
            <div className="property-card-actions">
              <button 
                className="quick-view-btn" 
                onClick={handleQuickViewClick}
              >
                Quick View
              </button>
              <button className="view-details-btn">
                Details
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
        >
          <div 
            className="quickview-modal" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="quickview-close-btn" 
              onClick={() => setIsQuickViewOpen(false)}
              aria-label="Close quick view"
            >
              ✕
            </button>
            
            <div className="quickview-content">
              <div className="quickview-image-side">
                <img 
                  src={displayImage || FALLBACK_IMAGE} 
                  alt={title} 
                  className="quickview-image" 
                />
              </div>
              <div className="quickview-details-side">
                <div>
                  <span className="quickview-type-badge">
                    {formatPropertyType(property_type)}
                  </span>
                  <h2 className="quickview-title">{title}</h2>
                  <p className="quickview-location">
                    <LocationIcon /> {locality ? `${locality}, ` : ''}{city}, {state}
                  </p>
                </div>
                
                <div className="quickview-price-box">
                  <span className="price">{formatPrice(monthly_rent)}</span>
                  <span className="price-sub"> / month</span>
                  {maintenance > 0 && <span className="price-sub" style={{ marginLeft: '10px' }}>+ ₹{maintenance} Maintenance</span>}
                </div>

                <div className="quickview-specs">
                  <div className="quickview-spec-item">
                    <span className="quickview-spec-icon"><BedIcon /></span>
                    <span><strong>Beds:</strong> {bedrooms} BHK</span>
                  </div>
                  <div className="quickview-spec-item">
                    <span className="quickview-spec-icon"><BathIcon /></span>
                    <span><strong>Baths:</strong> {bathrooms}</span>
                  </div>
                  <div className="quickview-spec-item">
                    <span className="quickview-spec-icon"><AreaIcon /></span>
                    <span><strong>Area:</strong> {area_sqft || '—'} sqft</span>
                  </div>
                  <div className="quickview-spec-item">
                    <span className="quickview-spec-icon">🪑</span>
                    <span><strong>Furnishing:</strong> {furnishing?.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="quickview-spec-item">
                    <span className="quickview-spec-icon">🚗</span>
                    <span><strong>Parking:</strong> {parking?.replace(/-/g, ' ') || '—'}</span>
                  </div>
                </div>

                <div className="quickview-desc">
                  <h3>Overview</h3>
                  <p>
                    {description || 'No description provided.'}
                  </p>
                </div>

                <div className="quickview-owner">
                  <div className="quickview-owner-avatar">
                    {owner_name ? owner_name.charAt(0).toUpperCase() : 'O'}
                  </div>
                  <div className="quickview-owner-info">
                    <h4>{owner_name || 'Owner'}</h4>
                    {isAuthenticated ? (
                      <span>{owner_phone || 'Contact not shared'}</span>
                    ) : (
                      <span>Please login to view contact</span>
                    )}
                  </div>
                </div>

                <div className="quickview-actions-row">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setIsQuickViewOpen(false);
                      handleCardClick();
                    }}
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