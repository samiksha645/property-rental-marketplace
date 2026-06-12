import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/api';
import { API_BASE_URL } from '../services/authService';
import PropertyCard from '../components/property/PropertyCard';
import './HomePage.css';

const popularCities = [
  { name: 'Ahmedabad', state: 'Gujarat', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80', count: 150, countLabel: '150+' },
  { name: 'Jaipur', state: 'Rajasthan', image: 'https://images.unsplash.com/photo-1477587458883-471a5ed94245?auto=format&fit=crop&w=800&q=80', count: 120, countLabel: '120+' },
  { name: 'Noida', state: 'Uttar Pradesh', image: 'https://images.unsplash.com/photo-1595841696667-aa68d601dd1a?auto=format&fit=crop&w=800&q=80', count: 200, countLabel: '200+' },
  { name: 'Gurugram', state: 'Haryana', image: 'https://images.unsplash.com/photo-1601579621360-685a21edd83a?auto=format&fit=crop&w=800&q=80', count: 250, countLabel: '250+' },
  { name: 'Lucknow', state: 'Uttar Pradesh', image: 'https://images.unsplash.com/photo-1598091857921-6b2d7a24badc?auto=format&fit=crop&w=800&q=80', count: 140, countLabel: '140+' },
  { name: 'Delhi', state: 'Delhi', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80', count: 500, countLabel: '500+' },
  { name: 'Mumbai', state: 'Maharashtra', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=800&q=80', count: 450, countLabel: '450+' },
  { name: 'Bangalore', state: 'Karnataka', image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80', count: 350, countLabel: '350+' },
  { name: 'Hyderabad', state: 'Telangana', image: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?auto=format&fit=crop&w=800&q=80', count: 300, countLabel: '300+' },
  { name: 'Pune', state: 'Maharashtra', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80', count: 280, countLabel: '280+' },
  { name: 'Chennai', state: 'Tamil Nadu', image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80', count: 220, countLabel: '220+' },
  { name: 'Kolkata', state: 'West Bengal', image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80', count: 180, countLabel: '180+' },
];

// Only keep the 6 required property types - removed: Builder Floor, Farm House, Penthouse, Office, Shop, Warehouse
const categories = [
  { name: 'Apartment', icon: '🏢', count: 0, slug: 'apartment' },
  { name: 'Flat', icon: '🏠', count: 0, slug: 'flat' },
  { name: 'Villa', icon: '🏡', count: 0, slug: 'villa' },
  { name: 'Independent House', icon: '🏠', count: 0, slug: 'independent-house' },
  { name: 'Studio Apartment', icon: '📐', count: 0, slug: 'studio-apartment' },
  { name: 'PG', icon: '🏘️', count: 0, slug: 'pg' },
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
    icon: '✅',
    title: 'Verified Properties',
    desc: 'Every listing is verified for authenticity. We ensure you get exactly what you see.',
  },
  {
    icon: '🛡️',
    title: 'Secure Booking',
    desc: 'Your booking and payments are protected with our secure platform.',
  },
  {
    icon: '🏙️',
    title: 'Pan India Coverage',
    desc: 'Properties available across all major Indian cities with local expertise.',
  },
  {
    icon: '🤝',
    title: 'Direct Owner Contact',
    desc: 'Connect directly with property owners. No middlemen, no brokerage.',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [latestProperties, setLatestProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({ city: '', type: '', budget: '' });
  const [citiesList, setCitiesList] = useState(popularCities);

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [featuredRes, latestRes] = await Promise.all([
        propertyService.getFeaturedProperties(8),
        propertyService.getAllProperties({}, 1, 8),
      ]);
      if (featuredRes.success) setFeaturedProperties(featuredRes.properties);
      if (latestRes.success) setLatestProperties(latestRes.properties);

      // Fetch city counts from database and merge
      try {
        const citiesResponse = await fetch(`${API_BASE_URL}/cities`, { signal: AbortSignal.timeout(5000) });
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
        // City API failed, use fallback counts - don't show 0 properties
        console.warn('City API unavailable, using fallback counts');
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (searchFilters.city) params.set('city', searchFilters.city);
    if (searchFilters.type) params.set('type', searchFilters.type);
    if (searchFilters.budget) params.set('budget', searchFilters.budget);
    navigate(`/properties?${params.toString()}`);
  };

  const handlePropertyClick = (id) => {
    navigate(`/property/${id}`);
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-bg-pattern"></div>
        <div className="hero-content container">
          <div className="hero-text">
            <span className="hero-badge">🏡 India's Trusted Rental Platform</span>
            <h1 className="hero-title">Find Your Perfect<br />Rental Home in India</h1>
            <p className="hero-subtitle">Explore verified rental properties across India's top cities. Premium apartments, independent houses, villas and more.</p>
          </div>

          <form className="hero-search" onSubmit={handleSearch}>
            <div className="search-input-group">
              <div className="search-field search-field-city">
                <label>City</label>
                <select value={searchFilters.city} onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}>
                  <option value="">All Cities</option>
                  {popularCities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="search-field search-field-type">
                <label>Property Type</label>
                <select value={searchFilters.type} onChange={(e) => setSearchFilters({ ...searchFilters, type: e.target.value })}>
                  <option value="">All Types</option>
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="search-field search-field-budget">
                <label>Budget (₹/month)</label>
                <select value={searchFilters.budget} onChange={(e) => setSearchFilters({ ...searchFilters, budget: e.target.value })}>
                  <option value="">Any Budget</option>
                  <option value="0-10000">Under ₹10,000</option>
                  <option value="10000-20000">₹10,000 - ₹20,000</option>
                  <option value="20000-30000">₹20,000 - ₹30,000</option>
                  <option value="30000-50000">₹30,000 - ₹50,000</option>
                  <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                  <option value="100000-999999">₹1,00,000+</option>
                </select>
              </div>
              <button type="submit" className="search-submit-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Search
              </button>
            </div>
          </form>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">500+</span>
              <span className="hero-stat-label">Properties</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">20+</span>
              <span className="hero-stat-label">Cities</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">10K+</span>
              <span className="hero-stat-label">Happy Tenants</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Only 6 types */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Browse Categories</span>
            <h2 className="section-title">Find by Property Type</h2>
            <p className="section-subtitle">Choose from a wide range of rental properties across India</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <div key={i} className="category-card" onClick={() => navigate(`/properties?type=${cat.slug}`)}>
                <span className="category-icon">{cat.icon}</span>
                <h3 className="category-name">{cat.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section featured-section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Featured Listings</span>
            <h2 className="section-title">Premium Properties</h2>
            <p className="section-subtitle">Hand-picked premium rental properties across India</p>
          </div>
          {loading ? (
            <div className="loading-screen"><div className="spinner"></div><p>Loading featured properties...</p></div>
          ) : (
            <div className="properties-grid">
              {featuredProperties.slice(0, 6).map(p => (
                <PropertyCard key={p.id} property={p} onPropertyClick={handlePropertyClick} />
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
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
            <h2 className="section-title">The Best Way to Rent in India</h2>
            <p className="section-subtitle">We make finding your dream rental home easy, safe, and transparent</p>
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

      {/* Popular Cities */}
      <section id="explore" className="section cities-section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Popular Locations</span>
            <h2 className="section-title">Explore by City</h2>
            <p className="section-subtitle">Find rental properties in India's most popular cities</p>
          </div>
          <div className="cities-grid">
            {citiesList.map((city, i) => (
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

      {/* Latest Properties */}
      <section className="section latest-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">New Listings</span>
            <h2 className="section-title">Just Added</h2>
            <p className="section-subtitle">Recently added rental properties from across India</p>
          </div>
          {loading ? (
            <div className="loading-screen"><div className="spinner"></div></div>
          ) : (
            <div className="properties-grid">
              {latestProperties.slice(0, 4).map(p => (
                <PropertyCard key={p.id} property={p} onPropertyClick={handlePropertyClick} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section id="about" className="section testimonials-section" style={{ background: '#0f172a' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label" style={{ background: 'rgba(37,99,235,0.2)', color: '#60a5fa' }}>Testimonials</span>
            <h2 className="section-title" style={{ color: 'white' }}>What Our Users Say</h2>
            <p className="section-subtitle" style={{ color: '#94a3b8' }}>Thousands of happy tenants and landlords trust us</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(t.rating)].map((_, s) => <span key={s} className="star">★</span>)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.avatar}</div>
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

      {/* Newsletter */}
      <section className="section newsletter-section">
        <div className="container">
          <div className="newsletter-card">
            <div className="newsletter-content">
              <h2 className="newsletter-title">Get Latest Properties</h2>
              <p className="newsletter-subtitle">Subscribe to get notified about new rental properties in your preferred city.</p>
              <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }}>
                <input type="email" placeholder="Enter your email address" className="newsletter-input" required />
                <button type="submit" className="btn btn-primary btn-lg">Subscribe</button>
              </form>
              <p className="newsletter-note">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col footer-brand">
              <h3 className="footer-logo">🏡 Rental<span>Marketplace</span></h3>
              <p>India's most trusted rental property marketplace. Find verified rental homes, apartments, and PG accommodations across all major Indian cities.</p>
              <div className="footer-social">
                <a href="#" className="social-link">📱</a>
                <a href="#" className="social-link">📘</a>
                <a href="#" className="social-link">📸</a>
                <a href="#" className="social-link">🐦</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/properties">Browse Properties</a></li>
                <li><a href="/properties?type=apartment">Apartments</a></li>
                <li><a href="/properties?type=independent-house">Independent Houses</a></li>
                <li><a href="/properties?type=villa">Villas</a></li>
                <li><a href="/properties?type=pg">PG/Hostels</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Top Cities</h4>
              <ul>
                <li><a href="/properties?city=Ahmedabad">Ahmedabad</a></li>
                <li><a href="/properties?city=Jaipur">Jaipur</a></li>
                <li><a href="/properties?city=Noida">Noida</a></li>
                <li><a href="/properties?city=Gurugram">Gurugram</a></li>
                <li><a href="/properties?city=Lucknow">Lucknow</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                <li><a href="/contact">Contact Us</a></li>
                <li><a href="/faq">FAQ</a></li>
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