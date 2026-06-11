import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/api';
import BookingForm from '../components/booking/BookingForm';
import { useAuth } from '../context/AuthContext';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProperty();
    window.scrollTo(0, 0);
  }, [id]);

  const loadProperty = async () => {
    try {
      const result = await propertyService.getPropertyById(id);
      if (result.success) {
        setProperty(result.property);
      } else {
        setError(result.error || 'Property not found');
      }
    } catch (err) {
      setError('Failed to load property details');
    }
    setLoading(false);
  };

  const handleBookingSuccess = (booking, pricing) => {
    navigate('/dashboard');
  };

  const handleBookingError = (error) => {
    console.error('Booking error:', error);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/properties')} className="btn btn-primary">
          Browse Properties
        </button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Property Not Found</h2>
        <button onClick={() => navigate('/properties')} className="btn btn-primary">
          Browse Properties
        </button>
      </div>
    );
  }

  const images = property.images || [];
  const mainImage = images.length > 0 ? images[0] : null;

  return (
    <div className="property-details-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Properties
        </button>

        <div className="property-details-layout">
          <div className="property-details-main">
            {/* Image Gallery */}
            <div className="property-gallery">
              {mainImage ? (
                <img src={mainImage} alt={property.title} className="property-main-image" />
              ) : (
                <div className="property-image-placeholder">🏡</div>
              )}
              {images.length > 1 && (
                <div className="property-thumbnails">
                  {images.slice(1, 5).map((img, i) => (
                    <img key={i} src={img} alt={`${property.title} ${i + 2}`} className="property-thumbnail" />
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="property-info-section">
              <div className="property-title-section">
                <h1>{property.title}</h1>
                <p className="property-location">
                  📍 {property.city}{property.locality ? `, ${property.locality}` : ''}, {property.state}
                </p>
              </div>

              <div className="property-specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Type</span>
                  <span className="spec-value">{property.property_type}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Bedrooms</span>
                  <span className="spec-value">{property.bedrooms} BHK</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Bathrooms</span>
                  <span className="spec-value">{property.bathrooms}</span>
                </div>
                {property.area_sqft && (
                  <div className="spec-item">
                    <span className="spec-label">Area</span>
                    <span className="spec-value">{property.area_sqft} sqft</span>
                  </div>
                )}
                <div className="spec-item">
                  <span className="spec-label">Furnishing</span>
                  <span className="spec-value">{property.furnishing}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Parking</span>
                  <span className="spec-value">{property.parking || 'None'}</span>
                </div>
              </div>

              <div className="property-description">
                <h3>Description</h3>
                <p>{property.description || 'No description provided.'}</p>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div className="property-amenities">
                  <h3>Amenities</h3>
                  <div className="amenities-list">
                    {property.amenities.map((amenity, i) => (
                      <span key={i} className="amenity-tag">✓ {amenity}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="property-details-sidebar">
            <div className="booking-sidebar-card">
              <div className="price-display">
                <span className="price-amount">₹{property.monthly_rent?.toLocaleString()}</span>
                <span className="price-period">/month</span>
              </div>
              {property.security_deposit > 0 && (
                <p className="deposit-info">Security Deposit: ₹{property.security_deposit?.toLocaleString()}</p>
              )}
              {property.maintenance > 0 && (
                <p className="maintenance-info">Maintenance: ₹{property.maintenance}/month</p>
              )}

              {isAuthenticated ? (
                <BookingForm
                  property={property}
                  onBookingSuccess={handleBookingSuccess}
                  onBookingError={handleBookingError}
                />
              ) : (
                <div className="login-prompt">
                  <p>Please log in to book this property</p>
                  <button onClick={() => navigate('/login')} className="btn btn-primary btn-block">
                    Log In to Book
                  </button>
                </div>
              )}
            </div>

            {property.owner_name && (
              <div className="owner-card">
                <h4>Listed by</h4>
                <p className="owner-name">{property.owner_name}</p>
                {property.owner_phone && <p className="owner-phone">📞 {property.owner_phone}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;