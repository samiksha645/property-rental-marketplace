import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/api';
import PropertyCard from '../components/property/PropertyCard';
import './Properties.css';

const POPULAR_CITIES = ['Delhi','Noida','Greater Noida','Gurugram','Mumbai','Pune','Bangalore','Hyderabad','Chennai','Kolkata','Ahmedabad','Jaipur','Lucknow','Chandigarh'];

// Only the 6 required property types
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
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    property_type: searchParams.get('type') || '',
    min_rent: '',
    max_rent: '',
    bedrooms: '',
    furnishing: '',
    parking: '',
    pet_friendly: '',
    is_verified: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => { loadProperties(); }, [filters, searchTerm, page]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      let result;
      if (searchTerm) {
        result = await propertyService.searchProperties(searchTerm, page);
      } else {
        const activeFilters = {};
        Object.entries(filters).forEach(([k, v]) => { if (v) activeFilters[k] = v; });
        result = await propertyService.getAllProperties(activeFilters, page);
      }
      if (result.success) {
        setProperties(result.properties);
        setPagination(result.pagination);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadProperties();
  };

  const resetFilters = () => {
    setFilters({ city: '', property_type: '', min_rent: '', max_rent: '', bedrooms: '', furnishing: '', parking: '', pet_friendly: '', is_verified: '', sort_by: 'created_at', sort_order: 'desc' });
    setSearchTerm('');
    setPage(1);
  };

  const handlePropertyClick = (id) => navigate(`/property/${id}`);

  return (
    <div className="properties-page">
      <div className="container">
        <div className="properties-header">
          <h1>Rental Properties in India</h1>
          <p>Find your perfect rental home</p>
        </div>

        <form className="properties-search" onSubmit={handleSearch}>
          <input type="text" placeholder="Search by city, locality, or property..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input-wide" />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="properties-layout">
          <aside className="properties-sidebar">
            <h3>Filters</h3>
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
              <label>Bedrooms</label>
              <select value={filters.bedrooms} onChange={(e) => handleFilterChange('bedrooms', e.target.value)}>
                <option value="">Any</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Budget (₹/mo)</label>
              <div className="range-inputs">
                <input type="number" placeholder="Min" value={filters.min_rent} onChange={(e) => handleFilterChange('min_rent', e.target.value)} />
                <span>to</span>
                <input type="number" placeholder="Max" value={filters.max_rent} onChange={(e) => handleFilterChange('max_rent', e.target.value)} />
              </div>
            </div>
            <div className="filter-group">
              <label>Furnishing</label>
              <select value={filters.furnishing} onChange={(e) => handleFilterChange('furnishing', e.target.value)}>
                <option value="">Any</option>
                <option value="fully-furnished">Fully Furnished</option>
                <option value="semi-furnished">Semi Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Parking</label>
              <select value={filters.parking} onChange={(e) => handleFilterChange('parking', e.target.value)}>
                <option value="">Any</option>
                <option value="two-wheeler">Two Wheeler</option>
                <option value="four-wheeler">Four Wheeler</option>
                <option value="both">Both</option>
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
              <label><input type="checkbox" checked={filters.is_verified === 'true'} onChange={(e) => handleFilterChange('is_verified', e.target.checked ? 'true' : '')} /> Verified Only</label>
              <label><input type="checkbox" checked={filters.pet_friendly === 'true'} onChange={(e) => handleFilterChange('pet_friendly', e.target.checked ? 'true' : '')} /> Pet Friendly</label>
            </div>
            <button className="btn btn-secondary" onClick={resetFilters} style={{ width: '100%' }}>Reset Filters</button>
          </aside>

          <main className="properties-main">
            {loading ? (
              <div className="loading-screen"><div className="spinner"></div></div>
            ) : properties.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🏠</span>
                <h3>No properties found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="btn btn-secondary" onClick={resetFilters}>Reset Filters</button>
              </div>
            ) : (
              <>
                <div className="results-header">
                  <span>{pagination?.total || 0} properties found</span>
                </div>
                <div className="properties-grid">
                  {properties.map(p => <PropertyCard key={p.id} property={p} onPropertyClick={handlePropertyClick} />)}
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
                    <span>Page {page} of {pagination.totalPages}</span>
                    <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
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