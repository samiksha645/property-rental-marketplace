import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertyService, wishlistService, reviewService, bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/property/PropertyCard';
import './PropertyDetails.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token, user } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [similarProperties, setSimilarProperties] = useState([]);
  
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  
  // Booking state
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [availability, setAvailability] = useState(null);
  
  // Review state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ type: '', text: '' });

  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    loadProperty();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    checkWishlistStatus();
  }, [id, isAuthenticated]);

  // Check availability when dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (checkInDate && checkOutDate && property?.id) {
        const result = await bookingService.checkAvailability(
          property.id,
          checkInDate,
          checkOutDate
        );
        setAvailability(result);
        if (!result.success) {
          setBookingError(result.error || 'Unable to check availability');
        } else if (!result.available) {
          setBookingError('Selected dates are not available');
        } else {
          setBookingError('');
        }
      }
    };
    const debounceTimer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [checkInDate, checkOutDate, property]);

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
    if (navigator.share) {
      navigator.share({ title: property.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Property link copied to clipboard!');
    }
  };

  const handleReport = () => {
    alert('Thank you. This property listing has been flagged for verification.');
  };

  // Booking handlers
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!checkInDate || !checkOutDate) {
      setBookingError('Please select check-in and check-out dates');
      return;
    }
    if (!availability?.available) {
      setBookingError('Selected dates are not available');
      return;
    }
    
    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      const result = await bookingService.createBooking({
        property_id: property.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        guest_count: guestCount,
        special_requests: specialRequests || null,
      }, token);

      if (result.success) {
        setBookingSuccess('Booking request submitted successfully!');
        setTimeout(() => { setBookingSuccess(''); }, 4000);
      } else {
        setBookingError(result.error || 'Failed to create booking');
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to create booking');
    }
    setBookingLoading(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setSubmittingReview(true);
    setReviewMsg({ type: '', text: '' });
    try {
      const result = await reviewService.createReview(token, id, {
        rating: userRating,
        comment: userComment
      });
      if (result.success) {
        setReviewMsg({ type: 'success', text: 'Review submitted successfully!' });
        setUserComment('');
        const updated = await propertyService.getPropertyById(id);
        if (updated.success && updated.property) setProperty(updated.property);
      } else {
        setReviewMsg({ type: 'error', text: result.error || 'Failed to submit review' });
      }
    } catch (err) {
      setReviewMsg({ type: 'error', text: 'An unexpected error occurred' });
    }
    setSubmittingReview(false);
  };

  const getSafeImageUrl = (img, index = 0) => {
    if (imageErrors[index]) return FALLBACK_IMAGE;
    if (!img || img === '') return FALLBACK_IMAGE;
    return img;
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const getMinCheckInDate = () => new Date().toISOString().split('T')[0];
  const getMinCheckOutDate = () => {
    if (checkInDate) {
      const nextDay = new Date(checkInDate);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay.toISOString().split('T')[0];
    }
    return getMinCheckInDate();
  };

  // Dynamically load Leaflet Map
  useEffect(() => {
    if (!property || !property.latitude || !property.longitude) return;
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css'; link.rel = 'stylesheet';
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
      if (mapContainer && !mapContainer._leaflet_id && window.L) {
        const lat = parseFloat(property.latitude);
        const lng = parseFloat(property.longitude);
        const map = window.L.map('property-map').setView([lat, lng], 14);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        window.L.marker([lat, lng]).addTo(map)
          .bindPopup(`<b>${property.title}</b><br>₹${parseFloat(property.monthly_rent).toLocaleString()}/mo`)
          .openPopup();
      }
    }
  }, [mapLoaded, property]);

  const openSlider = (index) => { setActiveImageIndex(index); setIsSliderOpen(true); };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ display: 'inline-block' }}></div>
        <p style={{ marginTop: '16px', color: '#64748b' }}>Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Property Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>{error || "We couldn't find the listing you requested."}</p>
        <button onClick={() => navigate('/properties')} className="btn btn-primary">Back to Listings</button>
      </div>
    );
  }

  const images = Array.isArray(property.images) ? property.images : [];
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];
  const schools = Array.isArray(property.nearby_schools) ? property.nearby_schools : [];
  const hospitals = Array.isArray(property.nearby_hospitals) ? property.nearby_hospitals : [];
  const reviews = Array.isArray(property.reviews) ? property.reviews : [];
  const ratingInfo = property.rating || { average_rating: 0, total_reviews: 0 };

  const renderStars = (count) => '★'.repeat(count) + '☆'.repeat(5 - count);
  const totalPricing = availability?.success && availability?.available && availability?.pricing;

  return (
    <div className="property-details-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link><span>/</span>
          <Link to="/properties">Properties</Link><span>/</span>
          <span>{property.title}</span>
        </div>

        {/* Header */}
        <div className="property-details-header">
          <div className="property-title-row">
            <div>
              <h1>{property.title}</h1>
              <div className="property-meta-info">
                {property.is_verified && <span className="verified-badge">✓ Verified Property</span>}
                <span>📍 {property.locality ? `${property.locality}, ` : ''}{property.city}, {property.state}</span>
                <span>•</span>
                <span className="type-badge">{property.property_type?.replace(/-/g, ' ')}</span>
              </div>
            </div>
            <div className="property-actions">
              <button className="action-btn action-btn-share" onClick={handleShare}>🔗 Share</button>
              <button className={`action-btn action-btn-save ${isWishlisted ? 'saved' : ''}`} onClick={handleWishlistToggle}>
                {isWishlisted ? '❤️ Saved' : '🤍 Save'}
              </button>
              <button className="action-btn action-btn-flag" onClick={handleReport}>⚠️ Flag</button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="gallery-container">
          {images.length > 0 ? (
            <div className={`gallery-grid ${images.length > 1 ? 'multiple' : 'single'}`}>
              <div className="gallery-item" onClick={() => openSlider(0)}>
                <img src={getSafeImageUrl(images[0], 0)} alt="Main view" onError={() => handleImageError(0)} />
              </div>
              {images.length > 1 && (
                <div className="gallery-side">
                  {images.slice(1, 3).map((img, idx) => (
                    <div key={idx} className="gallery-side-item" onClick={() => openSlider(idx + 1)}>
                      <img src={getSafeImageUrl(img, idx + 1)} alt="" onError={() => handleImageError(idx + 1)} />
                      {images.length > 3 && idx === 1 && <div className="photo-count-overlay">+{images.length - 3} Photos</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="gallery-fallback"><img src={FALLBACK_IMAGE} alt="Fallback" /></div>
          )}
        </div>

        {/* Main Grid */}
        <div className="property-details-layout">
          {/* Left Column */}
          <div className="property-details-main">
            <div className="details-card-section">
              <h3>Overview</h3>
              <div className="specs-grid">
                {[
                  { icon: '🛏️', label: 'Bedrooms', value: `${property.bedrooms} BHK` },
                  { icon: '🚿', label: 'Bathrooms', value: `${property.bathrooms} Bath` },
                  { icon: '📐', label: 'Area', value: `${property.area_sqft || '—'} Sqft` },
                  { icon: '🪑', label: 'Furnishing', value: property.furnishing?.replace(/-/g, ' '), capitalize: true },
                ].map((s, i) => (
                  <div key={i} className="spec-card">
                    <span className="spec-card-icon">{s.icon}</span>
                    <div>
                      <div className="spec-card-label">{s.label}</div>
                      <div className="spec-card-value" style={s.capitalize ? { textTransform: 'capitalize' } : {}}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="details-card-section">
              <h3>Description</h3>
              <p className="description-text">{property.description || 'No description provided for this listing.'}</p>
            </div>

            {amenities.length > 0 && (
              <div className="details-card-section">
                <h3>Amenities & Facilities</h3>
                <div className="amenities-list">
                  {amenities.map((item, idx) => <span key={idx} className="amenity-tag">✓ {item}</span>)}
                </div>
              </div>
            )}

            <div className="details-card-section">
              <h3>Location</h3>
              <p style={{ color: '#5a5a6e', marginBottom: '16px', fontSize: '0.875rem' }}>
                📍 {property.address_line1}, {property.locality ? `${property.locality}, ` : ''}{property.city}, {property.state} - {property.pincode}
              </p>
              {property.latitude && property.longitude ? <div id="property-map"></div> : <div className="map-placeholder">🗺️ Map coordinates not shared.</div>}
            </div>

            {(property.nearby_metro || schools.length > 0 || hospitals.length > 0) && (
              <div className="details-card-section">
                <h3>Nearby Points of Interest</h3>
                <div className="nearby-grid">
                  {property.nearby_metro && <div className="nearby-section"><h4>🚇 Metro Station</h4><p>{property.nearby_metro}</p></div>}
                  {schools.length > 0 && <div className="nearby-section"><h4>🏫 Schools</h4><ul>{schools.map((s, idx) => <li key={idx}>{s}</li>)}</ul></div>}
                  {hospitals.length > 0 && <div className="nearby-section"><h4>🏥 Hospitals</h4><ul>{hospitals.map((h, idx) => <li key={idx}>{h}</li>)}</ul></div>}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="details-card-section">
              <h3>Tenant Reviews ({ratingInfo.total_reviews || 0})</h3>
              {ratingInfo.total_reviews > 0 && (
                <div className="review-summary">
                  <div className="review-average">{ratingInfo.average_rating}</div>
                  <div>
                    <div className="review-stars">{renderStars(Math.round(ratingInfo.average_rating))}</div>
                    <div className="review-count">Average based on {ratingInfo.total_reviews} reviews</div>
                  </div>
                </div>
              )}
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <h4>Write a Review</h4>
                  {reviewMsg.text && <div className={`review-msg ${reviewMsg.type}`}>{reviewMsg.text}</div>}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.875rem', color: '#5a5a6e' }}>Rating:</span>
                    <select value={userRating} onChange={(e) => setUserRating(Number(e.target.value))}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #f0f0f8', fontSize: '0.875rem' }}>
                      <option value="5">5 Stars (Excellent)</option>
                      <option value="4">4 Stars (Good)</option>
                      <option value="3">3 Stars (Average)</option>
                      <option value="2">2 Stars (Poor)</option>
                      <option value="1">1 Star (Terrible)</option>
                    </select>
                  </div>
                  <textarea placeholder="Describe your renting experience..." value={userComment} onChange={(e) => setUserComment(e.target.value)} required rows="3" />
                  <button type="submit" disabled={submittingReview} className="btn btn-primary" style={{ marginTop: '12px' }}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <p style={{ background: '#f8f8fc', padding: '14px', borderRadius: '10px', fontSize: '0.813rem', color: '#8a8a9e', fontStyle: 'italic', marginBottom: '24px' }}>
                  <Link to="/login" style={{ color: '#a8882e', fontWeight: 600 }}>Login</Link> to submit a review for this property.
                </p>
              )}
              {reviews.length === 0 ? (
                <p style={{ color: '#8a8a9e', fontStyle: 'italic', fontSize: '0.875rem' }}>No reviews yet. Be the first!</p>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="review-item">
                    <div className="review-author">
                      <div className="review-author-avatar">{r.user_name ? r.user_name[0] : 'U'}</div>
                      <div className="review-author-info">
                        <div className="review-author-name">{r.user_name || 'Anonymous'}</div>
                        <div className="review-author-stars">{renderStars(r.rating)}</div>
                      </div>
                      <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="review-comment">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar - Booking */}
          <div className="property-details-sidebar">
            <div className="sidebar-booking-card">
              <div style={{ marginBottom: '16px' }}>
                <span className="price-large">₹{parseFloat(property.monthly_rent || 0).toLocaleString()}</span>
                <span className="price-label"> / month</span>
              </div>
              
              <div className="price-breakdown">
                <div className="price-breakdown-row">
                  <span>Security Deposit</span>
                  <span>₹{parseFloat(property.security_deposit || 0).toLocaleString()}</span>
                </div>
                {property.maintenance > 0 && (
                  <div className="price-breakdown-row">
                    <span>Maintenance</span>
                    <span>₹{parseFloat(property.maintenance).toLocaleString()}/mo</span>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <form onSubmit={handleBookingSubmit} style={{ marginTop: '16px' }}>
                  <div className="booking-form-group">
                    <label>Check-in</label>
                    <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)}
                      min={getMinCheckInDate()} required disabled={bookingLoading} />
                  </div>
                  <div className="booking-form-group">
                    <label>Check-out</label>
                    <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)}
                      min={getMinCheckOutDate()} required disabled={bookingLoading} />
                  </div>
                  <div className="booking-form-group">
                    <label>Guests</label>
                    <select value={guestCount} onChange={(e) => setGuestCount(parseInt(e.target.value))} disabled={bookingLoading}>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  
                  {bookingError && <div className="booking-msg error">{bookingError}</div>}
                  {bookingSuccess && <div className="booking-msg success">{bookingSuccess}</div>}
                  
                  {totalPricing && (
                    <div className="price-breakdown" style={{ background: '#f8f8fc', padding: '12px', borderRadius: '10px' }}>
                      <div className="price-breakdown-row">
                        <span>Duration</span>
                        <span>{totalPricing.months} mo ({totalPricing.days} days)</span>
                      </div>
                      <div className="price-breakdown-row">
                        <span>Total Rent</span>
                        <span>₹{totalPricing.total_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 'bold', marginTop: '12px', minHeight: '48px' }} disabled={bookingLoading}>
                    {bookingLoading ? 'Processing...' : 'Request Booking'}
                  </button>
                </form>
              ) : (
                <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 'bold', marginTop: '12px', minHeight: '48px' }}>
                  Login to Book
                </button>
              )}
            </div>

            <div className="sidebar-owner-card">
              <div className="owner-card-header">
                <div className="owner-avatar">👤</div>
                <div>
                  <h4 className="owner-name">{property.owner_name || 'Landlord'}</h4>
                  <span className="owner-verified">Verified Owner</span>
                </div>
              </div>
              <div className="owner-details">
                <div>📞 {property.owner_phone || '+91-XXXXX-XXXXX'}</div>
                <div>✉️ {property.owner_email || 'landlord@email.com'}</div>
              </div>
              <button className="btn-contact" onClick={() => alert('Owner notification sent!')}>Contact Owner</button>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="similar-properties-section">
            <h2>Similar Listings in {property.city}</h2>
            <div className="similar-grid">
              {similarProperties.map(p => (
                <PropertyCard key={p.id} property={p} onPropertyClick={(pid) => navigate(`/property/${pid}`)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isSliderOpen && property.images && (
        <div className="lightbox-overlay">
          <button className="lightbox-close-btn" onClick={() => setIsSliderOpen(false)}>✕</button>
          <div className="lightbox-content">
            <img src={getSafeImageUrl(property.images[activeImageIndex], activeImageIndex)} alt="" onError={() => handleImageError(activeImageIndex)} />
            <div className="lightbox-nav">
              <button className="lightbox-nav-btn" onClick={() => setActiveImageIndex(prev => (prev - 1 + property.images.length) % property.images.length)}>◀ Prev</button>
              <span className="lightbox-counter">Image {activeImageIndex + 1} of {property.images.length}</span>
              <button className="lightbox-nav-btn" onClick={() => setActiveImageIndex(prev => (prev + 1) % property.images.length)}>Next ▶</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;