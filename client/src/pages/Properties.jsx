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

const Properties = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
          {/* Sidebar Filters */}
          <aside className="properties-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Filters</h3>
              <button 
                onClick={resetFilters} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.813rem', cursor: 'pointer', fontWeight: '600' }}
              >
                Clear All
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
              <div className="range-inputs" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={filters.min_rent} 
                  onChange={(e) => handleFilterChange('min_rent', e.target.value)} 
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
                <span style={{ color: '#64748b' }}>to</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={filters.max_rent} 
                  onChange={(e) => handleFilterChange('max_rent', e.target.value)} 
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
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

            <div className="filter-checkboxes" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={filters.is_verified === 'true'} onChange={(e) => handleFilterChange('is_verified', e.target.checked ? 'true' : '')} /> Verified Properties Only
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={filters.pet_friendly === 'true'} onChange={(e) => handleFilterChange('pet_friendly', e.target.checked ? 'true' : '')} /> Pet Friendly Listings
              </label>
            </div>
          </aside>

          {/* Listings Main Section */}
          <main className="properties-main" style={{ flex: 1 }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {[1, 2, 3, 4].map(n => (
                  <div key={n} style={{ height: '380px', backgroundColor: '#f1f5f9', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '64px 20px', background: '#f8fafc', borderRadius: '16px' }}>
                <span className="empty-icon" style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🏘️</span>
                <h3>No rental properties match your filters</h3>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>Try clearing some filters or searching for a different keyword</p>
                <button className="btn btn-secondary" onClick={resetFilters}>Reset All Filters</button>
              </div>
            ) : (
              <>
                <div className="results-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', color: '#475569', fontWeight: '500' }}>
                  <span>{pagination?.total || 0} properties found</span>
                </div>
                <div className="properties-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                  {properties.map(p => (
                    <PropertyCard 
                      key={p.id} 
                      property={p} 
                      onPropertyClick={(id) => navigate(`/property/${id}`)} 
                    />
                  ))}
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '40px', alignItems: 'center' }}>
                    <button 
                      disabled={page <= 1} 
                      onClick={() => setPage(p => p - 1)}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                      ← Previous
                    </button>
                    <span style={{ color: '#475569', fontWeight: '500' }}>Page {page} of {pagination.totalPages}</span>
                    <button 
                      disabled={page >= pagination.totalPages} 
                      onClick={() => setPage(p => p + 1)}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer' }}
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
    </div>
  );
};

export default Properties;