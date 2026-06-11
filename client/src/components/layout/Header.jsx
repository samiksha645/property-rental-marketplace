import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleLogout = async () => {
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

  return (
    <header className="site-header">
      <div className="container header-container">
        <Link to="/" className="header-logo">
          🏡 Rental<span>Marketplace</span>
        </Link>

        <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/properties" className="nav-link" onClick={() => setMenuOpen(false)}>Browse</Link>
          {isAuthenticated && (
            <>
              <Link to="/wishlist" className="nav-link" onClick={() => setMenuOpen(false)}>Wishlist</Link>
              <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            </>
          )}
          {isAdmin() && (
            <Link to="/admin" className="nav-link nav-admin" onClick={() => setMenuOpen(false)}>Admin</Link>
          )}
        </nav>

        <div className="header-actions">
          <button className="header-icon-btn" onClick={() => setSearchOpen(!searchOpen)} title="Search">
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

          <button className="header-mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={`hamburger ${menuOpen ? 'active' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Search Dropdown */}
      {searchOpen && (
        <div className="header-search-dropdown">
          <form className="header-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by city, locality, or property name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header-search-input"
              autoFocus
            />
            <button type="submit" className="header-search-btn">Search</button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;