import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertyService, wishlistService } from '../services/api';
import { API_BASE_URL } from '../services/authService';
import BookingForm from '../components/booking/BookingForm';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/property/PropertyCard';
import './PropertyDetails.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [similarProperties, setSimilarProperties] = useState([]);
  
  // Gallery state
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  
  // Map loading state
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    loadProperty();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    checkWishlistStatus();
  }, [id, isAuthenticated]);

  const loadProperty = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await propertyService.getPropertyById(id);
      if (result.success && result.property) {
        setProperty(result.property);
        loadSimilarProperties(result.property.city, result.property.property_type, result.property.id);
      } else {
        setError(result.error || 'Property not found');
      }
    } catch (err) {
      setError('Failed to load property details');
    }
    setLoading(false);
  };

  const checkWishlistStatus = async () => {
    if (!isAuthenticated || !id || !token) return;
    try {
      const result = await wishlistService.isWishlisted(token, id);
      if (result.success) {
        setIsWishlisted(result.is_wishlisted);
      }
    } catch (err) {
      console.error('Failed to check wishlist status:', err);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!token) return;
    try {
      let result;
      if (isWishlisted) {
        result = await wishlistService.removeFromWishlist(token, id);
      } else {
        result = await wishlistService.addToWishlist(token, id);
      }
      if (result.success) {
        setIsWishlisted(!isWishlisted);
      } else {
        console.error('Wishlist toggle failed:', result.error);
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const loadSimilarProperties = async (city, type, currentId) => {
    try {
      const res = await propertyService.getAllProperties({ city, limit: 4 });
      if (res.success && res.properties) {
        setSimilarProperties(res.properties.filter(p => p.id !== currentId).slice(0, 3));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Property link copied to clipboard!');
  };

  const handleBookingSuccess = () => {
    navigate('/dashboard');
  };

  const handleBookingError = (error) => {
    console.error('Booking error:', error);
  };

  // Get safe image URL with fallback
  const getSafeImageUrl = (img, index = 0) => {
    if (imageErrors[index]) return FALLBACK_IMAGE;
    if (!img || img === '') return FALLBACK_IMAGE;
    // If the URL is a relative path or missing protocol, use fallback
    if (typeof img === 'string' && !img.startsWith('http://') && !img.startsWith('https://') && !img.startsWith('/')) {
      return FALLBACK_IMAGE;
    }
    return img || FALLBACK_IMAGE;
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  // Dynamically load Leaflet Map
  useEffect(() => {
    if (!property || !property.latitude || !property.longitude) return;
    
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, [property]);

  useEffect(() => {
    if (mapLoaded && property && property.latitude && property.longitude) {
      const mapContainer = document.getElementById('property-map');
      if (mapContainer && !mapContainer._leaflet_id) {
        const lat = parseFloat(property.latitude);
        const lng = parseFloat(property.longitude);
        
        if (window.L) {
          const map = window.L.map('property-map').setView([lat, lng], 14);
          
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          const customIcon = window.L.divIcon({
            className: 'custom-map-pin',
            html: `<div class="pin-marker">🏡</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
          });

          window.L.marker([lat, lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<b>${property.title}</b><br>₹${parseFloat(property.monthly_rent).toLocaleString()}/mo`)
            .openPopup();
        }
      }
    }
  }, [mapLoaded, property]);

  // Gallery slider handlers
  const openSlider = (index) => {
    setActiveImageIndex(index);
    setIsSliderOpen(true);
  };

  const closeSlider = () => {
    setIsSliderOpen(false);
  };

  const nextImage = () => {
    if (property && property.images) {
      setActiveImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property && property.images) {
      setActiveImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  // Keyboard navigation for image slider
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isSliderOpen) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeSlider();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSliderOpen, property]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '500' }}>Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', color: '#0f172a', marginBottom: '12px' }}>Property Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>{error || "We couldn't find the property you were looking for."}</p>
        <button onClick={() => navigate('/properties')} className="btn btn-primary">
          Back to Listings
        </button>
      </div>
    );
  }

  const images = Array.isArray(property.images) ? property.images : [];
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];
  const schools = Array.isArray(property.nearby_schools) ? property.nearby_schools : [];
  const hospitals = Array.isArray(property.nearby_hospitals) ? property.nearby_hospitals : [];

  return (
    <div className="property-details-page">
      <div className="container">
        {/* Breadcrumbs and Top Actions */}
        <div className="property-details-header">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/properties">Properties</Link>
            <span>/</span>
            <Link to={`/properties?city=${property.city}`}>{property.city}</Link>
            <span>/</span>
            <span style={{ color: '#0f172a', fontWeight: '500' }}>{property.title.substring(0, 30)}...</span>
          </div>

          <div className="property-title-row">
            <div className="property-title-main">
              <h1>{property.title}</h1>
              <div className="property-meta-info">
                {property.is_verified && (
                  <span className="verified-badge">
                    ✓ Verified Listing
                  </span>
                )}
                <span className="property-location">
                  📍 {property.locality ? `${property.locality}, ` : ''}{property.city}, {property.state}
                </span>
                <span>•</span>
                <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                  {property.property_type ? (property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1).replace('-', ' ')) : 'Property'}
                </span>
              </div>
            </div>

            <div className="property-actions">
              <button className="action-btn" onClick={handleShare}>
                🔗 Share
              </button>
              <button 
                className={`action-btn ${isWishlisted ? 'wishlisted' : ''}`}
                onClick={handleWishlistToggle}
              >
                {isWishlisted ? '❤️ Saved' : '🤍 Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Modern Image Gallery - No "Show All Photos" button */}
        <div className="gallery-container">
          {images.length > 0 ? (
            <div className={`gallery-grid ${images.length >= 2 ? 'gallery-grid-2' : ''}`}>
              {images.slice(0, 2).map((img, index) => (
                <div key={index} className="gallery-item" onClick={() => openSlider(index)}>
                  <img 
                    src={getSafeImageUrl(img, index)} 
                    alt={`${property.title} view ${index + 1}`}
                    onError={() => handleImageError(index)}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  {images.length > 2 && index === 1 && (
                    <div className="gallery-more-overlay" onClick={() => openSlider(0)}>
                      <span>+{images.length - 2} more</span>
                    </div>
                  )}
                </div>
              ))}
              {images.length === 1 && (
                <div className="gallery-item gallery-item-full" onClick={() => openSlider(0)}>
                  <img 
                    src={getSafeImageUrl(images[0], 0)} 
                    alt={`${property.title} main`}
                    onError={() => handleImageError(0)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="gallery-no-image">
              <img 
                src={FALLBACK_IMAGE} 
                alt="Property" 
                className="gallery-fallback-image"
              />
            </div>
          )}
        </div>

        {/* Main Layout Grid */}
        <div className="property-details-layout">
          {/* Left Column: Property Information */}
          <div className="property-details-main">
            {/* Overview / Specs */}
            <div className="details-card-section">
              <h3>Overview</h3>
              <div className="specs-grid">
                <div className="spec-card">
                  <span className="spec-icon">🛏️</span>
                  <div className="spec-info">
                    <span className="spec-name">Bedrooms</span>
                    <span className="spec-val">{property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Studio/Commercial'}</span>
                  </div>
                </div>
                <div className="spec-card">
                  <span className="spec-icon">🚿</span>
                  <div className="spec-info">
                    <span className="spec-name">Bathrooms</span>
                    <span className="spec-val">{property.bathrooms} Bath</span>
                  </div>
                </div>
                {property.area_sqft && (
                  <div className="spec-card">
                    <span className="spec-icon">📏</span>
                    <div className="spec-info">
                      <span className="spec-name">Super Area</span>
                      <span className="spec-val">{property.area_sqft} sqft</span>
                    </div>
                  </div>
                )}
                <div className="spec-card">
                  <span className="spec-icon">🛋️</span>
                  <div className="spec-info">
                    <span className="spec-name">Furnishing</span>
                    <span className="spec-val">{property.furnishing ? property.furnishing.replace('-', ' ') : 'Not specified'}</span>
                  </div>
                </div>
                <div className="spec-card">
                  <span className="spec-icon">🚗</span>
                  <div className="spec-info">
                    <span className="spec-name">Parking</span>
                    <span className="spec-val">{property.parking ? property.parking.replace('-', ' ') : 'Not specified'}</span>
                  </div>
                </div>
                <div className="spec-card">
                  <span className="spec-icon">🐾</span>
                  <div className="spec-info">
                    <span className="spec-name">Pets</span>
                    <span className="spec-val">{property.pet_friendly ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="details-card-section">
              <h3>About this property</h3>
              <p className="description-text">{property.description || 'No description provided.'}</p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="details-card-section">
                <h3>What this place offers</h3>
                <div className="amenities-container">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="amenity-chip">
                      <span className="amenity-chip-check">✓</span> {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Map */}
            <div className="details-card-section">
              <h3>Location</h3>
              <p style={{ color: '#475569', marginBottom: '16px', fontSize: '0.938rem', fontWeight: '500' }}>
                📍 {property.address_line1}{property.address_line2 ? `, ${property.address_line2}` : ''}, {property.locality}, {property.city}, {property.state} - {property.pincode}
              </p>
              
              {property.latitude && property.longitude ? (
                <div id="property-map"></div>
              ) : (
                <div style={{ height: '200px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  🗺️ Map Location Not Set
                </div>
              )}
            </div>

            {/* Nearby Section */}
            {(property.nearby_metro || schools.length > 0 || hospitals.length > 0) && (
              <div className="details-card-section">
                <h3>Nearby Facilities</h3>
                <div className="nearby-grid">
                  {property.nearby_metro && (
                    <div className="nearby-col">
                      <h4>🚇 Metro Station</h4>
                      <div className="nearby-list">
                        <div className="nearby-item">
                          <span>{property.nearby_metro.split('(')[0]}</span>
                          {property.nearby_metro.includes('(') && (
                            <span className="nearby-dist">
                              {property.nearby_metro.substring(property.nearby_metro.indexOf('(') + 1, property.nearby_metro.indexOf(')'))}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {schools.length > 0 && (
                    <div className="nearby-col">
                      <h4>🏫 Schools</h4>
                      <div className="nearby-list">
                        {schools.map((school, idx) => (
                          <div key={idx} className="nearby-item">
                            <span>{school}</span>
                            <span className="nearby-dist">~1.2 km</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {hospitals.length > 0 && (
                    <div className="nearby-col">
                      <h4>🏥 Hospitals</h4>
                      <div className="nearby-list">
                        {hospitals.map((hospital, idx) => (
                          <div key={idx} className="nearby-item">
                            <span>{hospital}</span>
                            <span className="nearby-dist">~1.5 km</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Booking Card & Owner Info */}
          <div className="property-details-sidebar">
            <div className="sidebar-booking-card">
              <div className="sidebar-price-display">
                <div>
                  <span className="sidebar-price-val">₹{parseFloat(property.monthly_rent || 0).toLocaleString()}</span>
                  <span className="sidebar-price-period"> / month</span>
                </div>
              </div>

              <div className="sidebar-fee-details">
                {parseFloat(property.security_deposit || 0) > 0 && (
                  <div className="sidebar-fee-row">
                    <span>Security Deposit</span>
                    <span>₹{parseFloat(property.security_deposit).toLocaleString()}</span>
                  </div>
                )}
                {parseFloat(property.maintenance || 0) > 0 && (
                  <div className="sidebar-fee-row">
                    <span>Maintenance Fee</span>
                    <span>₹{parseFloat(property.maintenance).toLocaleString()}/mo</span>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <BookingForm
                  property={property}
                  onBookingSuccess={handleBookingSuccess}
                  onBookingError={handleBookingError}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '16px' }}>Please login to make a booking request</p>
                  <button 
                    onClick={() => navigate('/login')} 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '600' }}
                  >
                    Login to Book
                  </button>
                </div>
              )}
            </div>

            {/* Owner Details Card */}
            <div className="sidebar-owner-card">
              <div className="owner-header">
                <div className="owner-avatar">
                  {property.owner_name ? property.owner_name.split(' ').map(n=>n[0]).join('') : 'O'}
                </div>
                <div className="owner-title">
                  <h4>{property.owner_name || 'Property Owner'}</h4>
                  <p>Listed by Owner</p>
                </div>
              </div>

              <div className="owner-contact-details">
                <div className="owner-contact-item">
                  <span>📞</span> {property.owner_phone || '+91-XXXXX-XXXXX'}
                </div>
                <div className="owner-contact-item">
                  <span>✉️</span> {property.owner_email || 'owner@email.com'}
                </div>
              </div>
              <button className="btn-contact" onClick={() => alert('Contact request sent to owner!')}>
                Contact Owner
              </button>
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className="similar-properties-section">
            <h2>Similar Properties in {property.city}</h2>
            <div className="properties-grid">
              {similarProperties.map(p => (
                <PropertyCard 
                  key={p.id} 
                  property={p} 
                  onPropertyClick={(id) => navigate(`/property/${id}`)} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Image Slider Overlay */}
      {isSliderOpen && property && property.images && (
        <div className="lightbox-overlay">
          <button className="lightbox-close-btn" onClick={closeSlider}>✕</button>
          
          <div className="lightbox-main">
            <button className="lightbox-nav-btn prev" onClick={prevImage}>◀</button>
            <img 
              src={getSafeImageUrl(property.images[activeImageIndex], activeImageIndex)} 
              alt={`${property.title} view ${activeImageIndex + 1}`} 
              className="lightbox-image"
              onError={() => handleImageError(activeImageIndex)}
            />
            <button className="lightbox-nav-btn next" onClick={nextImage}>▶</button>
          </div>

          <div className="lightbox-nav-row" style={{ display: 'none' }}>
            <button className="lightbox-nav-btn prev" onClick={prevImage}>◀</button>
            <button className="lightbox-nav-btn next" onClick={nextImage}>▶</button>
          </div>
          
          <span className="lightbox-counter">
            Photo {activeImageIndex + 1} of {property.images.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;