import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/api';
import { API_BASE_URL } from '../services/authService';
import PropertyCard from '../components/property/PropertyCard';
import './HomePage.css';

const popularCities = [
  { name: 'Delhi', state: 'Delhi', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80', count: 120, countLabel: '120+' },
  { name: 'Noida', state: 'Uttar Pradesh', image: 'https://images.unsplash.com/photo-1595841696667-aa68d601dd1a?auto=format&fit=crop&w=800&q=80', count: 95, countLabel: '95+' },
  { name: 'Gurugram', state: 'Haryana', image: 'https://images.unsplash.com/photo-1601579621360-685a21edd83a?auto=format&fit=crop&w=800&q=80', count: 110, countLabel: '110+' },
  { name: 'Mumbai', state: 'Maharashtra', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=800&q=80', count: 150, countLabel: '150+' },
  { name: 'Bangalore', state: 'Karnataka', image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80', count: 135, countLabel: '135+' },
  { name: 'Pune', state: 'Maharashtra', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80', count: 80, countLabel: '80+' },
];

const categories = [
  { name: 'Apartment', icon: '🏢', slug: 'apartment' },
  { name: 'Flat', icon: '🏠', slug: 'flat' },
  { name: 'Villa', icon: '🏡', slug: 'villa' },
  { name: 'Independent House', icon: '🛖', slug: 'independent-house' },
  { name: 'Studio Apartment', icon: '📐', slug: 'studio-apartment' },
  { name: 'PG', icon: '🏘️', slug: 'pg' },
];

const testimonials = [
  {
    name: 'Rahul Sharma',
    location: 'Delhi',
    text: 'Found the perfect apartment in Dwarka within a week. The platform made it incredibly easy to compare properties and connect with owners directly.',
    rating: 5,
    avatar: 'RS',
  },
  {
    name: 'Priya Patel',
    location: 'Mumbai',
    text: 'As a working professional relocating to Mumbai, this site was a lifesaver. Verified listings and smooth booking process. Highly recommended!',
    rating: 5,
    avatar: 'PP',
  },
  {
    name: 'Amit Singh',
    location: 'Bangalore',
    text: 'The best rental platform in India! Found a great villa in Whitefield with all amenities. The owner verification gave us complete peace of mind.',
    rating: 5,
    avatar: 'AS',
  },
];

const whyChooseUs = [
  {
    icon: '🛡️',
    title: 'Verified Listings',
    desc: 'Every single listing is thoroughly verified. No fake ads, no scams.',
  },
  {
    icon: '🤝',
    title: 'Zero Brokerage',
    desc: 'Direct contact with trusted landlords. Save thousands on commission.',
  },
  {
    icon: '⚡',
    title: 'Instant Booking',
    desc: 'Reserve slots for viewings or book rooms instantly through our platform.',
  },
  {
    icon: '📊',
    title: 'Realtime Price Insights',
    desc: 'Stay informed with standard rental ranges and analytics for each city.',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [latestProperties, setLatestProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState('rent');
  const [searchFilters, setSearchFilters] = useState({ city: '', type: '', budget: '', search: '' });
  const [citiesList, setCitiesList] = useState(popularCities);

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [featuredRes, latestRes] = await Promise.all([
        propertyService.getFeaturedProperties(6),
        propertyService.getAllProperties({}, 1, 4),
      ]);
      if (featuredRes.success) setFeaturedProperties(featuredRes.properties);
      if (latestRes.success) setLatestProperties(latestRes.properties);

      try {
        const citiesResponse = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/api/v1/cities`);
        const citiesData = await citiesResponse.json();
        if (citiesData.success && citiesData.data) {
          const merged = popularCities.map(localCity => {
            const apiCity = citiesData.data.find(c => c.name.toLowerCase() === localCity.name.toLowerCase());
            const dbCount = apiCity ? parseInt(apiCity.total_properties) || 0 : 0;
            return {
              ...localCity,
              count: dbCount > 0 ? dbCount : localCity.count,
              countLabel: dbCount > 0 ? `${dbCount}+` : localCity.countLabel
            };
          });
          setCitiesList(merged);
        }
      } catch (err) {
        console.warn('City count fetch error:', err);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchFilters.search) params.set('search', searchFilters.search);
    if (searchFilters.city) params.set('city', searchFilters.city);
    if (searchFilters.type) params.set('type', searchFilters.type);
    if (searchFilters.budget) {
      const [min, max] = searchFilters.budget.split('-');
      if (min) params.set('min_rent', min);
      if (max) params.set('max_rent', max);
    }
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="homepage">
      {/* Hero Section - Premium */}
      <section className="hero-section">
        <div className="hero-image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury property"
            className="hero-bg-image"
          />
        </div>
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        
        <div className="hero-content container-wide">
          <div className="hero-text">
            <span className="hero-badge">✦ India's Most Trusted Property Marketplace</span>
            <h1 className="hero-title">
              Find Your Perfect<br />
              <span className="highlight">Rental Home</span>
            </h1>
            <p className="hero-subtitle">
              Discover premium verified properties across India's top cities. 
              No brokerages, zero hassles, complete transparency.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => navigate('/properties')}>
                Explore Properties
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/#explore')}>
                View Locations
              </button>
            </div>

            {/* Statistics */}
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">1,500+</span>
                <span className="hero-stat-label">Verified Listings</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">14+</span>
                <span className="hero-stat-label">Indian Cities</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">25,000+</span>
                <span className="hero-stat-label">Happy Families</span>
              </div>
            </div>
          </div>

          {/* Search Panel */}
          <div className="search-panel-container">
            <div className="rent-buy-toggle">
              <button 
                onClick={() => setSearchMode('rent')} 
                className={searchMode === 'rent' ? 'active-btn' : 'inactive-btn'}
              >
                📋 Rent (Verified)
              </button>
              <button 
                onClick={() => {
                  setSearchMode('buy');
                  alert('Commercial property buying section coming soon! Browsing verified rentals is currently active.');
                  setSearchMode('rent');
                }} 
                className="inactive-btn"
              >
                💰 Buy / Invest
              </button>
            </div>
            
            <form onSubmit={handleSearch}>
              <div className="search-input-group">
                <div className="search-field">
                  <label>Search Locality</label>
                  <input 
                    type="text" 
                    placeholder="Enter area, locality or landmark..." 
                    value={searchFilters.search}
                    onChange={(e) => setSearchFilters({ ...searchFilters, search: e.target.value })}
                  />
                </div>
                
                <div className="search-field">
                  <label>City</label>
                  <select 
                    value={searchFilters.city} 
                    onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
                  >
                    <option value="">All Cities</option>
                    {popularCities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="search-field">
                  <label>Type</label>
                  <select 
                    value={searchFilters.type} 
                    onChange={(e) => setSearchFilters({ ...searchFilters, type: e.target.value })}
                  >
                    <option value="">All Types</option>
                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>

                <div className="search-field">
                  <label>Budget</label>
                  <select 
                    value={searchFilters.budget} 
                    onChange={(e) => setSearchFilters({ ...searchFilters, budget: e.target.value })}
                  >
                    <option value="">Any Budget</option>
                    <option value="0-10000">Under ₹10k</option>
                    <option value="10000-25000">₹10k - ₹25k</option>
                    <option value="25000-50000">₹25k - ₹50k</option>
                    <option value="50000-100000">₹50k - ₹1L</option>
                    <option value="100000-9999999">₹1L +</option>
                  </select>
                </div>

                <button type="submit" className="search-submit-btn">
                  🔍 Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section id="explore" className="section cities-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Popular Locations</span>
            <h2 className="section-title">Explore Premium Destinations</h2>
            <p className="section-subtitle">Find premium rental options near IT Parks, business complexes, and top colleges across India.</p>
          </div>
          <div className="cities-grid">
            {citiesList.slice(0, 6).map((city, i) => (
              <div key={i} className="city-card" onClick={() => navigate(`/properties?city=${city.name}`)}>
                <div className="city-image-wrapper">
                  <img 
                    src={city.image} 
                    alt={city.name} 
                    className="city-image" 
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="city-overlay"></div>
                </div>
                <div className="city-info">
                  <h3 className="city-name">{city.name}</h3>
                  <span className="city-state">{city.state}</span>
                  <span className="city-count">{city.countLabel} Properties</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Categories */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Categories</span>
            <h2 className="section-title">Browse by Property Type</h2>
            <p className="section-subtitle">Find exactly what you're looking for from our curated categories.</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <div key={i} className="category-card" onClick={() => navigate(`/properties?type=${cat.slug}`)}>
                <div className="category-icon-wrapper">
                  <span>{cat.icon}</span>
                </div>
                <span className="category-name">{cat.name}</span>
                <span className="category-count">Browse →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Featured Listings</span>
            <h2 className="section-title">Premium Rentals</h2>
            <p className="section-subtitle">Hand-picked homes containing modern amenities, verified details, and direct owner pricing.</p>
          </div>
          
          {loading ? (
            <div className="grid-auto">
              {[1, 2, 3].map(n => (
                <div key={n} className="skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="properties-grid">
              {featuredProperties.slice(0, 6).map(p => (
                <PropertyCard key={p.id} property={p} onPropertyClick={(id) => navigate(`/property/${id}`)} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '52px' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/properties')}>
              View All Properties →
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="services" className="section why-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Why Choose Us</span>
            <h2 className="section-title">Rent Transparently</h2>
            <p className="section-subtitle">A professional portal ensuring tenant and landlord trust at every transaction.</p>
          </div>
          <div className="why-grid">
            {whyChooseUs.map((item, i) => (
              <div key={i} className="why-card">
                <div className="why-icon-wrapper">
                  <span className="why-icon">{item.icon}</span>
                </div>
                <h3 className="why-title">{item.title}</h3>
                <p className="why-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section id="about" className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label" style={{ background: 'rgba(201,168,76,0.1)', color: '#d4b96a', border: '1px solid rgba(201,168,76,0.15)' }}>Client Reviews</span>
            <h2 className="section-title" style={{ color: 'white' }}>Success Stories</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.5)' }}>Real reviews from tenants who found their perfect spaces with us.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">
                  ★ ★ ★ ★ ★
                </div>
                <p className="testimonial-text">
                  "{t.text}"
                </p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="testimonial-name">{t.name}</h4>
                    <span className="testimonial-location">📍 {t.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="section newsletter-section">
        <div className="container">
          <div className="newsletter-card">
            <div className="newsletter-content">
              <h2 className="newsletter-title">List Your Property Today</h2>
              <p className="newsletter-subtitle">
                Are you an owner looking to list flat, apartment, villa or PG? Get verified leads, direct communication, and robust verification.
              </p>
              <button 
                className="cta-btn" 
                onClick={() => navigate('/dashboard')}
              >
                Get Started as Owner →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col footer-brand">
              <h3 className="footer-logo">✦ Rental<span>Marketplace</span></h3>
              <p>India's most trusted rental property marketplace. Find verified rental homes, apartments, and PG accommodations across all major Indian cities.</p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/properties">Browse Properties</a></li>
                <li><a href="/properties?type=apartment">Apartments</a></li>
                <li><a href="/properties?type=independent-house">Independent Houses</a></li>
                <li><a href="/properties?type=pg">PG/Hostels</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Top Cities</h4>
              <ul>
                <li><a href="/properties?city=Delhi">Delhi NCR</a></li>
                <li><a href="/properties?city=Mumbai">Mumbai</a></li>
                <li><a href="/properties?city=Bangalore">Bangalore</a></li>
                <li><a href="/properties?city=Pune">Pune</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Support & Security</h4>
              <ul>
                <li><a href="/contact">Contact Support</a></li>
                <li><a href="/faq">Safety Guidelines</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 RentalMarketplace.in. All rights reserved. Made with ❤️ in India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;