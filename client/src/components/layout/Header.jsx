import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

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
  }, [location.pathname, location.hash]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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
      // Close dropdown when clicking outside
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
    { to: '/', label: 'Home' },
    { to: '/properties', label: 'Properties' },
    { to: '/#explore', label: 'Explore' },
    { to: '/#services', label: 'Services' },
    { to: '/#about', label: 'About' },
    { to: '/#contact', label: 'Contact' },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
          <div className="mobile-nav-header">
            <span className="mobile-nav-title">Menu</span>
            <button 
              className="mobile-nav-close" 
              onClick={closeMenu}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="nav-links">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${location.pathname === item.to ? 'nav-link-active' : ''}`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <Link to="/wishlist" className="nav-link" onClick={closeMenu}>Wishlist</Link>
                <Link to="/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
              </>
            )}

            {isAdmin() && (
              <Link to="/admin" className="nav-link nav-admin" onClick={closeMenu}>
                ⚙️ Admin Panel
              </Link>
            )}
          </div>

          {/* Mobile Auth Actions */}
          <div className="mobile-auth-actions">
            {isAuthenticated ? (
              <>
                <div className="mobile-user-info">
                  <span className="mobile-user-avatar">
                    {getInitials(user?.name)}
                  </span>
                  <div className="mobile-user-details">
                    <span className="mobile-user-name">{user?.name || 'User'}</span>
                    <span className="mobile-user-email">{user?.email || ''}</span>
                  </div>
                </div>
                <button className="btn btn-sm mobile-logout-btn" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </>
            ) : (
              <div className="mobile-auth-btns">
                <Link to="/login" className="btn btn-sm btn-secondary mobile-auth-link" onClick={closeMenu}>
                  Log In
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary mobile-auth-link" onClick={closeMenu}>
                  Sign Up
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
            🔍
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
                <span className="header-user-chevron">▼</span>
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
                    <span className="dropdown-item-icon">📊</span>
                    Dashboard
                  </Link>
                  
                  <Link to="/wishlist" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <span className="dropdown-item-icon">❤️</span>
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
                        <span className="dropdown-item-icon">⚙️</span>
                        Admin Panel
                      </Link>
                    </>
                  )}
                  
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                    <span className="dropdown-item-icon">🚪</span>
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
            <button type="submit" className="header-search-btn" aria-label="Submit search">🔍 Search</button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;