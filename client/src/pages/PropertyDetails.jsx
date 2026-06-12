import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertyService, wishlistService, reviewService } from '../services/api';
import { API_BASE_URL } from '../services/authService';
import BookingForm from '../components/booking/BookingForm';
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
  
  // Gallery state
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  
  // Review form state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ type: '', text: '' });

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
    alert('Property details link copied to clipboard!');
  };

  const handleReport = () => {
    alert('Thank you. This property listing has been flagged for verification.');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
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
        // Reload details to reflect the review
        const updated = await propertyService.getPropertyById(id);
        if (updated.success && updated.property) {
          setProperty(updated.property);
        }
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
            html: `<div class="pin-marker" style="font-size:24px;">🏡</div>`,
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

  const openSlider = (index) => {
    setActiveImageIndex(index);
    setIsSliderOpen(true);
  };

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
  const reviews = Array.isArray(property.reviews) ? property.reviews : [];
  const ratingInfo = property.rating || { average_rating: 0, total_reviews: 0 };

  return (
    <div className="property-details-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div className="property-details-header">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/properties">Properties</Link>
            <span>/</span>
            <span style={{ color: '#0f172a', fontWeight: '500' }}>{property.title}</span>
          </div>

          <div className="property-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginTop: '16px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{property.title}</h1>
              <div className="property-meta-info" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                {property.is_verified && <span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem' }}>✓ Verified Property</span>}
                <span>📍 {property.locality ? `${property.locality}, ` : ''}{property.city}, {property.state}</span>
                <span>•</span>
                <span style={{ textTransform: 'capitalize', fontWeight: '600', color: 'var(--primary)' }}>{property.property_type?.replace('-', ' ')}</span>
              </div>
            </div>

            <div className="property-actions" style={{ display: 'flex', gap: '12px' }}>
              <button className="action-btn" onClick={handleShare} style={{ background: '#f1f5f9', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                🔗 Share
              </button>
              <button 
                className={`action-btn ${isWishlisted ? 'wishlisted' : ''}`}
                onClick={handleWishlistToggle}
                style={{ background: isWishlisted ? '#fee2e2' : '#f1f5f9', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: isWishlisted ? '#ef4444' : '#0f172a' }}
              >
                {isWishlisted ? '❤️ Saved' : '🤍 Save'}
              </button>
              <button className="action-btn" onClick={handleReport} style={{ background: '#fef2f2', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#b91c1c' }}>
                ⚠️ Flag Listing
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="gallery-container" style={{ marginTop: '24px', borderRadius: '16px', overflow: 'hidden' }}>
          {images.length > 0 ? (
            <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: images.length > 1 ? '2fr 1fr' : '1fr', gap: '8px', height: '400px' }}>
              <div className="gallery-item" onClick={() => openSlider(0)} style={{ cursor: 'pointer', height: '100%' }}>
                <img src={getSafeImageUrl(images[0], 0)} alt="Main view" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => handleImageError(0)} />
              </div>
              {images.length > 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
                  {images.slice(1, 3).map((img, idx) => (
                    <div key={idx} className="gallery-item" onClick={() => openSlider(idx + 1)} style={{ cursor: 'pointer', flex: 1, position: 'relative' }}>
                      <img src={getSafeImageUrl(img, idx + 1)} alt="Alt view" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => handleImageError(idx + 1)} />
                      {images.length > 3 && idx === 1 && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                          +{images.length - 3} Photos
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: '350px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={FALLBACK_IMAGE} alt="Fallback view" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        {/* Core Layout Grid */}
        <div className="property-details-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginTop: '32px' }}>
          
          {/* Main Info */}
          <div className="property-details-main" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="details-card-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>Overview</h3>
              <div className="specs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                <div className="spec-card" style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🛏️</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Bedrooms</div>
                    <div style={{ fontWeight: '700' }}>{property.bedrooms} BHK</div>
                  </div>
                </div>
                <div className="spec-card" style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🚿</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Bathrooms</div>
                    <div style={{ fontWeight: '700' }}>{property.bathrooms} Bath</div>
                  </div>
                </div>
                <div className="spec-card" style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '24px' }}>📐</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Area</div>
                    <div style={{ fontWeight: '700' }}>{property.area_sqft || '—'} Sqft</div>
                  </div>
                </div>
                <div className="spec-card" style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🪑</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Furnishing</div>
                    <div style={{ fontWeight: '700', textTransform: 'capitalize' }}>{property.furnishing?.replace('-', ' ')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="details-card-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px' }}>Description</h3>
              <p style={{ color: '#475569', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{property.description || 'No description provided for this listing.'}</p>
            </div>

            {amenities.length > 0 && (
              <div className="details-card-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>Amenities & Facilities</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {amenities.map((item, idx) => (
                    <span key={idx} style={{ background: '#f1f5f9', padding: '8px 16px', borderRadius: '30px', fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Map & Location */}
            <div className="details-card-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Location</h3>
              <p style={{ color: '#475569', marginBottom: '16px' }}>📍 {property.address_line1}, {property.locality ? `${property.locality}, ` : ''}{property.city}, {property.state} - {property.pincode}</p>
              {property.latitude && property.longitude ? (
                <div id="property-map" style={{ height: '300px', borderRadius: '12px', overflow: 'hidden' }}></div>
              ) : (
                <div style={{ height: '200px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  🗺️ Map coordinates not shared.
                </div>
              )}
            </div>

            {/* Nearby Places Section */}
            {(property.nearby_metro || schools.length > 0 || hospitals.length > 0) && (
              <div className="details-card-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>Nearby Points of Interest</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {property.nearby_metro && (
                    <div>
                      <h4 style={{ fontWeight: '700', marginBottom: '8px' }}>🚇 Metro Station</h4>
                      <p style={{ color: '#475569', fontSize: '0.9rem' }}>{property.nearby_metro}</p>
                    </div>
                  )}
                  {schools.length > 0 && (
                    <div>
                      <h4 style={{ fontWeight: '700', marginBottom: '8px' }}>🏫 Schools</h4>
                      <ul style={{ color: '#475569', fontSize: '0.9rem', paddingLeft: '20px' }}>
                        {schools.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {hospitals.length > 0 && (
                    <div>
                      <h4 style={{ fontWeight: '700', marginBottom: '8px' }}>🏥 Hospitals</h4>
                      <ul style={{ color: '#475569', fontSize: '0.9rem', paddingLeft: '20px' }}>
                        {hospitals.map((h, idx) => <li key={idx}>{h}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="details-card-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>Tenant Reviews ({ratingInfo.total_reviews || 0})</h3>
              
              {/* Avg Rating Summary */}
              {ratingInfo.total_reviews > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>{ratingInfo.average_rating}</div>
                  <div>
                    <div style={{ color: '#f59e0b', fontSize: '1.2rem' }}>{'★'.repeat(Math.round(ratingInfo.average_rating)) + '☆'.repeat(5 - Math.round(ratingInfo.average_rating))}</div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Average rating based on {ratingInfo.total_reviews} reviews</div>
                  </div>
                </div>
              )}

              {/* Review Input Form */}
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} style={{ marginBottom: '32px', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ fontWeight: '700', marginBottom: '12px' }}>Write a Review</h4>
                  {reviewMsg.text && (
                    <div style={{ padding: '10px 16px', borderRadius: '6px', marginBottom: '12px', background: reviewMsg.type === 'success' ? '#d1fae5' : '#fee2e2', color: reviewMsg.type === 'success' ? '#065f46' : '#991b1b', fontSize: '0.875rem' }}>
                      {reviewMsg.text}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                    <span>Rating:</span>
                    <select value={userRating} onChange={(e) => setUserRating(Number(e.target.value))} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="5">5 Stars (Excellent)</option>
                      <option value="4">4 Stars (Good)</option>
                      <option value="3">3 Stars (Average)</option>
                      <option value="2">2 Stars (Poor)</option>
                      <option value="1">1 Star (Terrible)</option>
                    </select>
                  </div>
                  <textarea 
                    placeholder="Describe your renting experience, neighborhood, landlord behavior, water supply, electricity..." 
                    value={userComment} 
                    onChange={(e) => setUserComment(e.target.value)}
                    required
                    rows="3"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', fontSize: '0.9rem' }}
                  />
                  <button type="submit" disabled={submittingReview} className="btn btn-primary" style={{ marginTop: '12px', padding: '8px 20px', borderRadius: '6px' }}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <p style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic', marginBottom: '24px' }}>
                  Please login to submit a review for this property.
                </p>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p style={{ color: '#64748b', fontStyle: 'italic' }}>No reviews yet for this listing. Be the first to leave one!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ width: '36px', height: '36px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {r.user_name ? r.user_name[0] : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600' }}>{r.user_name || 'Anonymous Tenant'}</div>
                            <div style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '10px', lineHeight: '1.5' }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Sidebar (Booking & Owner Details) */}
          <div className="property-details-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="sidebar-booking-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'sticky', top: '100px' }}>
              <div>
                <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)' }}>₹{parseFloat(property.monthly_rent || 0).toLocaleString()}</span>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}> / month</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '16px 0', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#475569' }}>
                  <span>Security Deposit</span>
                  <span>₹{parseFloat(property.security_deposit || 0).toLocaleString()}</span>
                </div>
                {property.maintenance > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#475569' }}>
                    <span>Maintenance Fee</span>
                    <span>₹{parseFloat(property.maintenance).toLocaleString()}/mo</span>
                  </div>
                )}
              </div>
              {isAuthenticated ? (
                <BookingForm property={property} onBookingSuccess={() => navigate('/dashboard')} />
              ) : (
                <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: 'bold' }}>
                  Login to Request Booking
                </button>
              )}
            </div>

            {/* Owner/Landlord Card */}
            <div className="sidebar-owner-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', border: '1px solid #e2e8f0' }}>
                  👤
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: '700' }}>{property.owner_name || 'Landlord'}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#059669', background: '#d1fae5', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>Verified Owner</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: '#475569', marginBottom: '16px' }}>
                <div>📞 {property.owner_phone || '+91-XXXXX-XXXXX'}</div>
                <div>✉️ {property.owner_email || 'landlord@email.com'}</div>
              </div>
              <button 
                className="btn-contact" 
                onClick={() => alert('An SMS notification has been sent to the owner. They will reach back shortly!')}
                style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Contact Owner
              </button>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="similar-properties-section" style={{ marginTop: '56px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px' }}>Similar Listings in {property.city}</h2>
            <div className="properties-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {similarProperties.map(p => (
                <PropertyCard key={p.id} property={p} onPropertyClick={(pid) => navigate(`/property/${pid}`)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gallery Slides Overlay */}
      {isSliderOpen && property.images && (
        <div className="lightbox-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button className="lightbox-close-btn" onClick={() => setIsSliderOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>✕</button>
          <div style={{ maxWidth: '90%', maxHeight: '80%' }}>
            <img 
              src={getSafeImageUrl(property.images[activeImageIndex], activeImageIndex)} 
              alt="Lightbox" 
              style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }} 
              onError={() => handleImageError(activeImageIndex)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', color: 'white', fontWeight: '500' }}>
              <button onClick={() => setActiveImageIndex(prev => (prev - 1 + property.images.length) % property.images.length)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>◀ Prev</button>
              <span>Image {activeImageIndex + 1} of {property.images.length}</span>
              <button onClick={() => setActiveImageIndex(prev => (prev + 1) % property.images.length)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>Next ▶</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;