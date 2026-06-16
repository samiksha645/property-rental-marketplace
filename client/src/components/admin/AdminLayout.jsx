import React, { useState } from 'react';
import { NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', end: true, icon: '📊', label: 'Dashboard' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/properties', icon: '🏠', label: 'Properties' },
    { to: '/admin/bookings', icon: '📅', label: 'Bookings' },
    { to: '/admin/reviews', icon: '⭐', label: 'Reviews' },
    { to: '/admin/categories', icon: '🗂️', label: 'Categories' },
    { to: '/admin/cities', icon: '🏙️', label: 'Cities' },
  ];

  return (
    <div className={`admin-layout ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="admin-overlay" onClick={() => setMobileOpen(false)}></div>
      
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-section">
            <span className="logo-icon">🏡</span>
            <h2>Rental<span>Admin</span></h2>
          </div>
          <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}>✕</button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">MAIN MENU</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="/" className="view-site-link" target="_blank" rel="noreferrer">
            <span>🌐</span>
            <span>View Website</span>
          </a>
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'Admin'}</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button className="mobile-toggle-btn" onClick={() => setMobileOpen(true)}>
              ☰
            </button>
            <div className="header-breadcrumb">
              <span className="breadcrumb-home">Admin</span>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-current">Dashboard</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="header-user-info">
              <div className="header-avatar">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
              <div className="header-user-details">
                <span className="header-user-name">{user?.name || 'Admin'}</span>
                <span className="header-user-role">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;