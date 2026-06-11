import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const StatCard = ({ title, value, icon, color, trend }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon-box">{icon}</div>
    <div className="stat-info">
      <p className="stat-label">{title}</p>
      <h3 className="stat-value">{value}</h3>
      {trend && <span className="stat-trend">↑ {trend}</span>}
    </div>
  </div>
);

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const result = await adminService.getDashboardStats(token);
      if (result.success) {
        setStats(result.stats);
        setRecentBookings(result.recentBookings);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <span>⚠️</span>
        <p>{error}</p>
        <button onClick={loadDashboardData} className="retry-btn">Retry</button>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-greeting">
        <h2>Welcome back! 👋</h2>
        <p>Here's what's happening with your marketplace today.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          icon="👥"
          color="blue"
          trend="12% this month"
        />
        <StatCard
          title="Total Properties"
          value={stats?.totalProperties?.toLocaleString() || '0'}
          icon="🏠"
          color="green"
          trend="8 new this week"
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings?.toLocaleString() || '0'}
          icon="📅"
          color="purple"
          trend="5% increase"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue)}
          icon="💰"
          color="orange"
          trend="from confirmed bookings"
        />
      </div>

      <div className="dashboard-content-grid">
        <div className="dashboard-section recent-bookings-section">
          <div className="section-title-row">
            <h3>Recent Bookings</h3>
            <a href="/admin/bookings" className="view-all-link">View All →</a>
          </div>
          {recentBookings.length === 0 ? (
            <div className="empty-state">
              <span>📅</span>
              <p>No recent bookings</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Guest</th>
                    <th>Property</th>
                    <th>Check-in</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.slice(0, 8).map((booking) => (
                    <tr key={booking.id}>
                      <td className="booking-id">#{booking.id}</td>
                      <td>
                        <div className="guest-cell">
                          <div className="guest-avatar">{(booking.guest_name || 'U')[0]}</div>
                          <span>{booking.guest_name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="property-title-cell">
                        {booking.property_title ? booking.property_title.substring(0, 30) + '...' : 'N/A'}
                      </td>
                      <td>{new Date(booking.check_in_date).toLocaleDateString('en-IN')}</td>
                      <td>
                        <span className={`status-badge status-${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="amount-cell">₹{Number(booking.total_amount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-section quick-stats-section">
          <div className="section-title-row">
            <h3>Quick Stats</h3>
          </div>
          <div className="quick-stat-list">
            <div className="quick-stat-item">
              <span className="qs-icon">✅</span>
              <div className="qs-info">
                <span className="qs-label">Avg Booking Value</span>
                <span className="qs-value">{formatCurrency(stats?.avgBookingValue)}</span>
              </div>
            </div>
            <div className="quick-stat-item">
              <span className="qs-icon">🏙️</span>
              <div className="qs-info">
                <span className="qs-label">Cities Covered</span>
                <span className="qs-value">14 Cities</span>
              </div>
            </div>
            <div className="quick-stat-item">
              <span className="qs-icon">⭐</span>
              <div className="qs-info">
                <span className="qs-label">Avg Rating</span>
                <span className="qs-value">4.5 / 5.0</span>
              </div>
            </div>
            <div className="quick-stat-item">
              <span className="qs-icon">🔍</span>
              <div className="qs-info">
                <span className="qs-label">Verified Properties</span>
                <span className="qs-value">~70%</span>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h4>Quick Actions</h4>
            <a href="/admin/properties" className="qa-btn qa-green">+ Add Property</a>
            <a href="/admin/users" className="qa-btn qa-blue">👥 Manage Users</a>
            <a href="/admin/bookings" className="qa-btn qa-purple">📅 View Bookings</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;