import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/api';
import PropertyCard from '../components/property/PropertyCard';
import './Properties.css';

const POPULAR_CITIES = ['Delhi', 'Noida', 'Greater Noida', 'Gurugram', 'Mumbai', 'Pune', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh'];

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'flat', label: 'Flat' },
  { value: 'villa', label: 'Villa' },
  { value: 'independent-house', label: 'Independent House' },
  { value: 'studio-apartment', label: 'Studio Apartment' },
  { value: 'pg', label: 'PG' },
];

// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-line skeleton-line-sm"></div>
      <div className="skeleton-line skeleton-line-lg"></div>
      <div className="skeleton-line skeleton-line-full"></div>
      <div className="skeleton-footer">
        <div className="skeleton-price"></div>
        <div className="skeleton-buttons">
          <div className="skeleton-btn"></div>
          <div className="skeleton-btn"></div>
        </div>
      </div>
    </div>
  </div>
);

const Properties = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Initial filters combined from URL parameters
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    property_type: searchParams.get('type') || '',
    min_rent: searchParams.get('min_rent') || '',
    max_rent: searchParams.get('max_rent') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    furnishing: searchParams.get('furnishing') || '',
    parking: searchParams.get('parking') || '',
    pet_friendly: searchParams.get('pet_friendly') || '',
    is_verified: searchParams.get('is_verified') || '',
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadProperties();
  }, [filters, searchTerm, page]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const activeFilters = { ...filters };
      if (searchTerm) {
        activeFilters.q = searchTerm;
      }
      
      const cleanFilters = {};
      Object.entries(activeFilters).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) {
          cleanFilters[k] = v;
        }
      });

      const result = await propertyService.getAllProperties(cleanFilters, page);
      if (result.success) {
        setProperties(result.properties);
        setPagination(result.pagination);
      }
    } catch (err) {
      console.error('Error loading properties:', err);
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadProperties();
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      property_type: '',
      min_rent: '',
      max_rent: '',
      bedrooms: '',
      bathrooms: '',
      furnishing: '',
      parking: '',
      pet_friendly: '',
      is_verified: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    });
    setSearchTerm('');
    setPage(1);
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => 
    v !== '' && k !== 'sort_by' && k !== 'sort_order'
  ).length;

  // Close mobile filter on escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMobileFilterOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Lock body scroll when mobile filter is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileFilterOpen]);

  const renderFilterSidebar = (isMobile = false) => (
    <aside className={`properties-sidebar ${isMobile && mobileFilterOpen ? 'mobile-open' : ''}`}>
      {isMobile && (
        <div className="filter-drawer-header">
          <h3>Filters</h3>
          <button 
            className="filter-drawer-close" 
            onClick={() => setMobileFilterOpen(false)}
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>
      )}

      <div className="filter-header">
        <h3>Filters</h3>
        <button 
          onClick={resetFilters} 
          className="filter-clear-btn"
        >
          Clear All {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      <div className="filter-group">
        <label>City</label>
        <select value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)}>
          <option value="">All Cities</option>
          {POPULAR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label>Property Type</label>
        <select value={filters.property_type} onChange={(e) => handleFilterChange('property_type', e.target.value)}>
          <option value="">All Types</option>
          {PROPERTY_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Bedrooms (BHK)</label>
        <select value={filters.bedrooms} onChange={(e) => handleFilterChange('bedrooms', e.target.value)}>
          <option value="">Any</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4+ BHK</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Bathrooms</label>
        <select value={filters.bathrooms} onChange={(e) => handleFilterChange('bathrooms', e.target.value)}>
          <option value="">Any</option>
          <option value="1">1 Bath</option>
          <option value="2">2 Baths</option>
          <option value="3">3+ Baths</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Budget (₹/month)</label>
        <div className="range-inputs">
          <input 
            type="number" 
            placeholder="Min" 
            value={filters.min_rent} 
            onChange={(e) => handleFilterChange('min_rent', e.target.value)} 
          />
          <span style={{ color: '#8a8a9e', fontSize: '0.75rem' }}>to</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={filters.max_rent} 
            onChange={(e) => handleFilterChange('max_rent', e.target.value)} 
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Furnishing Status</label>
        <select value={filters.furnishing} onChange={(e) => handleFilterChange('furnishing', e.target.value)}>
          <option value="">Any</option>
          <option value="fully-furnished">Fully Furnished</option>
          <option value="semi-furnished">Semi Furnished</option>
          <option value="unfurnished">Unfurnished</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Parking Requirement</label>
        <select value={filters.parking} onChange={(e) => handleFilterChange('parking', e.target.value)}>
          <option value="">Any</option>
          <option value="two-wheeler">Two Wheeler Only</option>
          <option value="four-wheeler">Four Wheeler Only</option>
          <option value="both">Both (2 & 4 Wheeler)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Sort By</label>
        <select value={`${filters.sort_by}-${filters.sort_order}`} onChange={(e) => { const [s, o] = e.target.value.split('-'); handleFilterChange('sort_by', s); handleFilterChange('sort_order', o); }}>
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="rent-asc">Rent: Low to High</option>
          <option value="rent-desc">Rent: High to Low</option>
        </select>
      </div>

      <div className="filter-checkboxes">
        <label>
          <input type="checkbox" checked={filters.is_verified === 'true'} onChange={(e) => handleFilterChange('is_verified', e.target.checked ? 'true' : '')} /> Verified Properties Only
        </label>
        <label>
          <input type="checkbox" checked={filters.pet_friendly === 'true'} onChange={(e) => handleFilterChange('pet_friendly', e.target.checked ? 'true' : '')} /> Pet Friendly Listings
        </label>
      </div>
    </aside>
  );

  return (
    <div className="properties-page">
      <div className="container">
        <div className="properties-header">
          <h1>Find Rental Properties in India</h1>
          <p>Explore thousands of verified flats, studio apartments, PGs, and villas across tech hubs</p>
        </div>

        <form className="properties-search" onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            placeholder="Search by city, locality, landmark or description..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="search-input-wide" 
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="properties-layout">
          {/* Desktop Sidebar */}
          {renderFilterSidebar()}

          {/* Listings Main Section */}
          <main className="properties-main">
            {/* Mobile Filter Toggle */}
            <button 
              className="filter-toggle-mobile" 
              onClick={() => setMobileFilterOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </button>

            {loading ? (
              <div className="properties-grid">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <SkeletonCard key={n} />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🏘️</span>
                <h3>No rental properties match your filters</h3>
                <p>Try clearing some filters or searching for a different keyword</p>
                <button className="btn btn-secondary" onClick={resetFilters}>Reset All Filters</button>
              </div>
            ) : (
              <>
                <div className="results-header">
                  <span>{pagination?.total || 0} properties found</span>
                </div>
                <div className="properties-grid">
                  {properties.map(p => (
                    <PropertyCard 
                      key={p.id} 
                      property={p} 
                      onPropertyClick={(id) => navigate(`/property/${id}`)} 
                    />
                  ))}
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      disabled={page <= 1} 
                      onClick={() => setPage(p => p - 1)}
                    >
                      ← Previous
                    </button>
                    <span>Page {page} of {pagination.totalPages}</span>
                    <button 
                      disabled={page >= pagination.totalPages} 
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {mobileFilterOpen && (
        <div 
          className="filter-drawer-overlay" 
          onClick={() => setMobileFilterOpen(false)}
        />
      )}

      {/* Mobile Filter Drawer */}
      {renderFilterSidebar(true)}
    </div>
  );
};

export default Properties;