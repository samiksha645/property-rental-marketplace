import React, { useState } from 'react';
import './PropertyCard.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

const formatPrice = (price) => {
  if (!price) return '₹0';
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(1)}K`;
  return `₹${price}`;
};

const PropertyCard = ({ property, onPropertyClick }) => {
  const [imgError, setImgError] = useState(false);

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
  } = property;

  const handleClick = () => {
    if (onPropertyClick) onPropertyClick(id);
  };

  const displayImage = images && images.length > 0 ? images[0] : null;

  const formatPropertyType = (type) => {
    if (!type) return '';
    return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="property-card" onClick={handleClick}>
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
        <div className="property-card-type">{formatPropertyType(property_type)}</div>
      </div>

      <div className="property-card-content">
        <div className="property-card-location">
          📍 {city}{locality ? `, ${locality}` : ''}
        </div>
        
        <h3 className="property-card-title">{title}</h3>
        
        <div className="property-card-specs">
          <span className="spec" title="Bedrooms">🛏️ {bedrooms} BHK</span>
          <span className="spec" title="Bathrooms">🚿 {bathrooms}</span>
          {area_sqft && <span className="spec" title="Area">📐 {area_sqft} sqft</span>}
          <span className="spec" title="Furnishing">
            {furnishing === 'fully-furnished' ? '🪑 Fully' : furnishing === 'semi-furnished' ? '🪑 Semi' : '📦 Unfurnished'}
          </span>
          {parking && parking !== 'none' && <span className="spec" title="Parking">🚗 {parking}</span>}
        </div>

        <div className="property-card-divider"></div>

        <div className="property-card-footer">
          <div className="property-card-pricing">
            <span className="price-rent">{formatPrice(monthly_rent)}/mo</span>
            {security_deposit > 0 && (
              <span className="price-deposit">{formatPrice(security_deposit)} deposit</span>
            )}
          </div>
          <button className="view-details-btn">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;