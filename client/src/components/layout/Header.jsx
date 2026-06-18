import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

// SVG Icons for navigation
const NavIcons = {
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Properties: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Explore: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  Services: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  ),
  About: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Contact: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Wishlist: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Admin: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  User: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

const Header = ({ isTransparent }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close mobile menu and dropdown on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }, [location.pathname, location.hash]);

  // Lock body scroll when menu is open - handles scrollbar offset
  useEffect(() => {
    if (menuOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [menuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, dropdownOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const navItems = [
    { to: '/', label: 'Home', icon: NavIcons.Home },
    { to: '/properties', label: 'Properties', icon: NavIcons.Properties },
    { to: '/#explore', label: 'Explore', icon: NavIcons.Explore },
    { to: '/#services', label: 'Services', icon: NavIcons.Services },
    { to: '/#about', label: 'About', icon: NavIcons.About },
    { to: '/#contact', label: 'Contact', icon: NavIcons.Contact },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Check if a nav item is active
  const isActiveLink = (itemTo) => {
    if (itemTo === '/') return location.pathname === '/';
    if (itemTo.startsWith('/#')) return location.pathname === '/' && location.hash === itemTo.substring(1);
    return location.pathname.startsWith(itemTo);
  };

  return (
    <header className={`site-header ${isTransparent ? 'transparent' : ''}`} role="banner">
      <div className="container header-container">
        <Link to="/" className="header-logo" aria-label="Rental Marketplace Home">
          <span className="header-logo-icon">🏡</span>
          <span className="header-logo-text">
            <span className="header-logo-main">Rental<span>Marketplace</span></span>
            <span className="header-logo-sub">India's Trusted Rentals</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={`header-nav ${menuOpen ? 'open' : ''}`} ref={menuRef} role="navigation" aria-label="Main navigation">
          {/* Mobile Drawer Header */}
          <div className="mobile-nav-header">
            <div className="mobile-nav-brand">
              <span className="mobile-nav-logo-icon">🏡</span>
              <div className="mobile-nav-brand-text">
                <span className="mobile-nav-brand-title">Rental<span>Marketplace</span></span>
                <span className="mobile-nav-brand-sub">India's Trusted Rentals</span>
              </div>
            </div>
            <button 
              className="mobile-nav-close" 
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <NavIcons.Close />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="nav-links">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${isActiveLink(item.to) ? 'nav-link-active' : ''}`}
                onClick={closeMenu}
                tabIndex={0}
              >
                <span className="nav-link-icon">
                  <item.icon />
                </span>
                <span className="nav-link-label">{item.label}</span>
                {isActiveLink(item.to) && <span className="nav-link-active-dot"></span>}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <div className="nav-link-divider"></div>
                <Link to="/wishlist" className={`nav-link ${location.pathname === '/wishlist' ? 'nav-link-active' : ''}`} onClick={closeMenu}>
                  <span className="nav-link-icon"><NavIcons.Wishlist /></span>
                  <span className="nav-link-label">Wishlist</span>
                </Link>
                <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'nav-link-active' : ''}`} onClick={closeMenu}>
                  <span className="nav-link-icon"><NavIcons.Dashboard /></span>
                  <span className="nav-link-label">Dashboard</span>
                </Link>
              </>
            )}

            {isAdmin() && (
              <Link to="/admin" className="nav-link nav-link-admin" onClick={closeMenu}>
                <span className="nav-link-icon"><NavIcons.Admin /></span>
                <span className="nav-link-label">Admin Panel</span>
                <span className="nav-link-badge">Admin</span>
              </Link>
            )}
          </div>

          {/* Mobile Auth Actions */}
          <div className="mobile-auth-actions">
            {isAuthenticated ? (
              <>
                <div className="mobile-user-info">
                  <div className="mobile-user-avatar-wrapper">
                    <span className="mobile-user-avatar">
                      {getInitials(user?.name)}
                    </span>
                    <span className="mobile-user-online"></span>
                  </div>
                  <div className="mobile-user-details">
                    <span className="mobile-user-name">{user?.name || 'User'}</span>
                    <span className="mobile-user-email">{user?.email || ''}</span>
                  </div>
                </div>
                <button className="mobile-logout-btn" onClick={handleLogout} aria-label="Logout">
                  <NavIcons.Logout />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="mobile-auth-btns">
                <Link to="/login" className="mobile-auth-btn mobile-auth-btn-secondary" onClick={closeMenu}>
                  <NavIcons.User />
                  <span>Log In</span>
                </Link>
                <Link to="/register" className="mobile-auth-btn mobile-auth-btn-primary" onClick={closeMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Desktop Actions */}
        <div className="header-actions">
          <button 
            className="header-icon-btn" 
            onClick={() => setSearchOpen(!searchOpen)} 
            title="Search properties"
            aria-label="Toggle search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="tooltip">Search</span>
          </button>

          {isAuthenticated ? (
            <div className="header-user-menu" ref={dropdownRef}>
              <button 
                className="header-user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                <span className="header-user-avatar">
                  {getInitials(user?.name)}
                </span>
                <span className="header-user-name">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <svg className="header-user-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1l4 4 4-4" />
                </svg>
              </button>
              
              {dropdownOpen && (
                <div className="header-dropdown">
                  <div className="dropdown-header">
                    <span className="header-user-avatar" style={{ width: '38px', height: '38px', fontSize: '0.875rem' }}>
                      {getInitials(user?.name)}
                    </span>
                    <div className="dropdown-user-info">
                      <span className="dropdown-user-name">{user?.name || 'User'}</span>
                      <span className="dropdown-user-email">{user?.email || ''}</span>
                    </div>
                  </div>
                  
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <span className="dropdown-item-icon">
                      <NavIcons.Dashboard />
                    </span>
                    Dashboard
                  </Link>
                  
                  <Link to="/wishlist" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <span className="dropdown-item-icon">
                      <NavIcons.Wishlist />
                    </span>
                    Wishlist
                  </Link>
                  
                  <Link to="/dashboard?tab=listings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <span className="dropdown-item-icon">🏠</span>
                    My Listings
                  </Link>
                  
                  {isAdmin() && (
                    <>
                      <div className="dropdown-divider"></div>
                      <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <span className="dropdown-item-icon">
                          <NavIcons.Admin />
                        </span>
                        Admin Panel
                      </Link>
                    </>
                  )}
                  
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                    <span className="dropdown-item-icon">
                      <NavIcons.Logout />
                    </span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="header-auth-btns">
              <Link to="/login" className="btn btn-sm btn-secondary">Log In</Link>
              <Link to="/register" className="btn btn-sm btn-primary">Sign Up</Link>
            </div>
          )}

          <button 
            className="header-mobile-menu" 
            onClick={() => setMenuOpen(!menuOpen)}
            ref={hamburgerRef}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={`hamburger ${menuOpen ? 'active' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {menuOpen && <div className="mobile-overlay" onClick={closeMenu} aria-hidden="true"></div>}

      {/* Search Dropdown */}
      {searchOpen && (
        <div className="header-search-dropdown" role="search">
          <form className="header-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by city, locality, or property name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header-search-input"
              autoFocus
              aria-label="Search properties"
            />
            <button type="submit" className="header-search-btn" aria-label="Submit search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;