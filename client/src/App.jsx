import React, { useState, useEffect } from 'react';
import { propertyService, isOnline, checkServerHealth } from './services/api.js';
import PropertyGrid from './components/property/PropertyGrid.jsx';
import BookingForm from './components/booking/BookingForm.jsx';
import AdminPanel from './components/admin/AdminPanel.jsx';
import AddPropertyForm from './components/property/AddPropertyForm.jsx';
import './assets/css/pages/homepage.css';

const App = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [view, setView] = useState('listings'); // 'listings', 'details', 'add'
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    property_type: '',
    min_price: '',
    max_price: '',
  });
  const [offlineMode, setOfflineMode] = useState(false);
  const [serverStatus, setServerStatus] = useState(true);

  // Check server and connection status
  useEffect(() => {
    const checkStatus = async () => {
      const online = isOnline();
      if (!online) {
        setOfflineMode(true);
        setError('You are offline. Please check your internet connection.');
      } else {
        const serverOk = await checkServerHealth();
        setServerStatus(serverOk);
        if (!serverOk) {
          setError('Server is currently unavailable. Please try again later.');
        } else {
          setOfflineMode(false);
          setError(null);
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Load properties on mount and when filters/search change
  useEffect(() => {
    if (!offlineMode && serverStatus) {
      loadProperties();
    }
  }, [filters, searchTerm, offlineMode, serverStatus]);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    
    let result;
    if (searchTerm) {
      result = await propertyService.searchProperties(searchTerm);
    } else {
      // Apply filters
      const activeFilters = {};
      if (filters.city) activeFilters.city = filters.city;
      if (filters.property_type) activeFilters.property_type = filters.property_type;
      if (filters.min_price) activeFilters.min_price = filters.min_price;
      if (filters.max_price) activeFilters.max_price = filters.max_price;
      
      result = await propertyService.getAllProperties(activeFilters);
    }
    
    if (result.success) {
      setProperties(result.properties);
    } else {
      setError(result.error || 'Failed to load properties');
      setProperties([]);
    }
    
    setLoading(false);
  };

  const handlePropertyClick = async (propertyId) => {
    setLoading(true);
    const result = await propertyService.getPropertyById(propertyId);
    if (result.success) {
      setSelectedProperty(result.property);
      setView('details');
    } else {
      setError(result.error || 'Failed to load property details');
    }
    setLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSuccess = (booking, pricing) => {
    console.log('Booking successful:', booking, pricing);
    alert(`Booking confirmed! Total: $${pricing.total_amount}. Check your email for details.`);
    setView('listings');
  };

  const handleBookingError = (error) => {
    console.error('Booking error:', error);
    alert(`Booking failed: ${error}`);
  };

  const handleAddProperty = () => {
    setView('add');
  };

  const handleBackToListings = () => {
    setView('listings');
    setSelectedProperty(null);
    setSearchTerm('');
    setFilters({
      city: '',
      property_type: '',
      min_price: '',
      max_price: '',
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProperties();
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      property_type: '',
      min_price: '',
      max_price: '',
    });
    setSearchTerm('');
  };

  // Render property details view
  const renderPropertyDetails = () => {
    if (!selectedProperty) return null;

    return (
      <div className="property-details-view">
        <button className="back-button" onClick={handleBackToListings}>
          ← Back to Listings
        </button>
        
        <div className="property-details-layout">
          <div className="property-details-main">
            <div className="property-gallery">
              {selectedProperty.images && selectedProperty.images.length > 0 ? (
                <img 
                  src={selectedProperty.images[0]} 
                  alt={selectedProperty.title}
                  className="property-main-image"
                />
              ) : (
                <div className="property-no-image">No image available</div>
              )}
            </div>
            
            <div className="property-info">
              <h1>{selectedProperty.title}</h1>
              <div className="property-location-detail">
                📍 {selectedProperty.address_line1}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.postal_code}
              </div>
              
              <div className="property-stats">
                <span>🛏️ {selectedProperty.bedrooms} bedrooms</span>
                <span>🚽 {selectedProperty.bathrooms} bathrooms</span>
                <span>👥 {selectedProperty.max_guests} max guests</span>
                <span>📐 {selectedProperty.square_feet} sq ft</span>
              </div>
              
              <div className="property-description">
                <h3>Description</h3>
                <p>{selectedProperty.description}</p>
              </div>
              
              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div className="property-amenities">
                  <h3>Amenities</h3>
                  <div className="amenities-list">
                    {selectedProperty.amenities.map((amenity, index) => (
                      <span key={index} className="amenity-badge">✓ {amenity}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="property-details-sidebar">
            <BookingForm
              property={selectedProperty}
              onBookingSuccess={handleBookingSuccess}
              onBookingError={handleBookingError}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render add property form
  const renderAddProperty = () => {
    return (
      <div className="add-property-view">
        <div className="container">
          <button className="back-button" onClick={handleBackToListings} style={{ marginBottom: '20px' }}>
            ← Back to Listings
          </button>
          <AddPropertyForm 
            onPropertyAdded={(newProperty) => {
              setProperties(prev => [newProperty, ...prev]);
              setView('listings');
              alert('Successfully listed your property! It is now visible on the homepage.');
            }}
            onCancel={handleBackToListings}
          />
        </div>
      </div>
    );
  };

  // Render listings view
  const renderListings = () => {
    return (
      <>
        <div className="search-section">
          <div className="container">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search by city, property type, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">Search</button>
            </form>
            
            <div className="filters-section">
              <select
                value={filters.property_type}
                onChange={(e) => handleFilterChange('property_type', e.target.value)}
                className="filter-select"
              >
                <option value="">All Property Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="studio">Studio</option>
                <option value="townhouse">Townhouse</option>
              </select>
              
              <input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="filter-input"
              />
              
              <input
                type="number"
                placeholder="Min Price ($)"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                className="filter-input"
              />
              
              <input
                type="number"
                placeholder="Max Price ($)"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                className="filter-input"
              />
              
              <button onClick={resetFilters} className="reset-filters-btn">
                Reset
              </button>
            </div>
          </div>
        </div>

        <main className="main-content">
          <div className="container">
            {error && (
              <div className="error-banner">
                ⚠️ {error}
                {offlineMode && (
                  <button onClick={() => window.location.reload()} className="retry-btn">
                    Retry Connection
                  </button>
                )}
              </div>
            )}
            
            <PropertyGrid
              properties={properties}
              loading={loading}
              onPropertyClick={handlePropertyClick}
              onResetFilters={resetFilters}
            />
          </div>
        </main>
      </>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="logo" onClick={() => setView('listings')}>
              🏡 RentalMarketplace
            </div>
            
            <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                className="admin-panel-btn" 
                onClick={() => setView(view === 'admin' ? 'listings' : 'admin')}
                style={{
                  background: 'none',
                  border: '1px solid #ff385c',
                  color: '#ff385c',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {view === 'admin' ? 'View Site' : '⚙️ Admin Panel'}
              </button>
              {view === 'listings' && (
                <button className="add-property-btn" onClick={handleAddProperty}>
                  + List Your Property
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {view === 'listings' && renderListings()}
      {view === 'details' && renderPropertyDetails()}
      {view === 'add' && renderAddProperty()}
      {view === 'admin' && <AdminPanel onBack={() => setView('listings')} />}
    </div>
  );
};

export default App;