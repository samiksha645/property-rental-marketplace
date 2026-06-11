import React from 'react';
import './PropertyCard.css';

const formatPrice = (price) => {
  if (!price) return '₹0';
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(1)}K`;
  return `₹${price}`;
};

const PropertyCard = ({ property, onPropertyClick }) => {
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

  return (
    <div className="property-card" onClick={handleClick}>
      <div className="property-card-image-container">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={title} 
            className="property-card-image"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';
            }}
          />
        ) : (
          <div className="property-card-image-fallback">🏡</div>
        )}
        <div className="property-card-badges">
          {is_featured && <span className="badge badge-featured">⭐ Featured</span>}
          {is_verified && <span className="badge badge-verified">✓ Verified</span>}
          {pet_friendly && <span className="badge badge-primary">🐾 Pet Friendly</span>}
        </div>
        <div className="property-card-type">{property_type}</div>
      </div>

      <div className="property-card-content">
        <div className="property-card-location">
          📍 {city}{locality ? `, ${locality}` : ''}
        </div>
        
        <h3 className="property-card-title">{title}</h3>
        
        <div className="property-card-specs">
          <span className="spec" title="Bedrooms">🛏️ {bedrooms} Bhk</span>
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