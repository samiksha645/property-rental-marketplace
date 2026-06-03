import React from 'react';
import './PropertyCard.css';

const PropertyCard = ({ property, onPropertyClick }) => {
  const {
    id,
    title,
    city,
    state,
    property_type,
    bedrooms,
    bathrooms,
    base_price_per_night,
    images,
    is_featured,
  } = property;

  // Handle click on the card
  const handleClick = () => {
    if (onPropertyClick) {
      onPropertyClick(id);
    }
  };

  const displayImage = images && images.length > 0 ? images[0] : null;

  return (
    <div className="property-card" onClick={handleClick}>
      {is_featured && (
        <span className="featured-badge">★ Featured</span>
      )}
      
      <div className="property-card-image-container">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={title} 
            className="property-card-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
            }}
          />
        ) : (
          <div className="property-card-image-fallback">
            🏡
          </div>
        )}
      </div>

      <div className="property-card-content">
        <div className="property-card-meta">
          <span className="property-type">{property_type}</span>
          <span className="property-location">📍 {city}, {state}</span>
        </div>
        
        <h3 className="property-card-title">{title}</h3>
        
        <div className="property-card-specs">
          <span>🛏️ {bedrooms} Bed{bedrooms > 1 ? 's' : ''}</span>
          <span>🚽 {bathrooms} Bath{bathrooms > 1 ? 's' : ''}</span>
        </div>
        
        <div className="property-card-footer">
          <div className="property-card-price">
            <span className="price-amount">${parseFloat(base_price_per_night).toFixed(0)}</span>
            <span className="price-unit">/ night</span>
          </div>
          <button className="view-details-btn">View Details</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;