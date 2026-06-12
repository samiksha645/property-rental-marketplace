import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
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

  return (
    <header className="site-header" role="banner">
      <div className="container header-container">
        <Link to="/" className="header-logo" aria-label="Rental Marketplace Home">
          🏡 Rental<span>Marketplace</span>
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
              <Link to="/admin" className="nav-link nav-admin" onClick={closeMenu}>Admin Panel</Link>
            )}
          </div>

          {/* Mobile Auth Actions */}
          <div className="mobile-auth-actions">
            {isAuthenticated ? (
              <>
                <div className="mobile-user-info">
                  <span className="mobile-user-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <div className="mobile-user-details">
                    <span className="mobile-user-name">{user?.name || 'User'}</span>
                    <span className="mobile-user-email">{user?.email || ''}</span>
                  </div>
                </div>
                <button className="btn btn-sm btn-secondary mobile-logout-btn" onClick={handleLogout}>
                  Logout
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
          </button>

          {isAuthenticated ? (
            <div className="header-user-menu">
              <span className="header-user-name">{user?.name?.split(' ')[0]}</span>
              <button className="btn btn-sm btn-secondary" onClick={handleLogout}>Logout</button>
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
            <button type="submit" className="header-search-btn" aria-label="Submit search">Search</button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;