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
      {trend && <span className="stat-trend">{trend}</span>}
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
        <h2>Admin Dashboard Panel</h2>
        <p>Real-time analytics, user control, and property rental verifications.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          icon="👥"
          color="blue"
          trend={`${stats?.newUsers || 0} registered recently`}
        />
        <StatCard
          title="Active Listings"
          value={stats?.activeProperties?.toLocaleString() || '0'}
          icon="🏠"
          color="green"
          trend={`${stats?.pendingProperties || 0} pending approvals`}
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings?.toLocaleString() || '0'}
          icon="📅"
          color="purple"
          trend={`${stats?.pendingBookings || 0} pending bookings`}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue)}
          icon="💰"
          color="orange"
          trend={`₹${(stats?.monthlyRevenue || 0).toLocaleString()} this month`}
        />
      </div>

      {/* Analytics Charts & Visual Analytics Section */}
      <div className="analytics-grid">
        {/* Category Share Chart */}
        <div className="analytics-card">
          <h3 className="analytics-card-title">Category Breakdown</h3>
          <div className="category-bars">
            <div className="category-bar-item">
              <div className="category-bar-header">
                <span>Apartments & Flats</span>
                <strong>65%</strong>
              </div>
              <div className="category-bar-track">
                <div className="category-bar-fill category-bar-blue" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="category-bar-item">
              <div className="category-bar-header">
                <span>Villas & Independent Houses</span>
                <strong>20%</strong>
              </div>
              <div className="category-bar-track">
                <div className="category-bar-fill category-bar-green" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div className="category-bar-item">
              <div className="category-bar-header">
                <span>PG & Shared Rooms</span>
                <strong>15%</strong>
              </div>
              <div className="category-bar-track">
                <div className="category-bar-fill category-bar-purple" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Analytics */}
        <div className="analytics-card">
          <h3 className="analytics-card-title">Property Trust Analytics</h3>
          <div className="trust-analytics">
            <div className="trust-stat">
              <div className="trust-value trust-green">
                {stats?.totalProperties ? Math.round((stats.activeProperties / stats.totalProperties) * 100) : 100}%
              </div>
              <div className="trust-label">Verified Properties</div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-stat">
              <div className="trust-value trust-blue">
                {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 100}%
              </div>
              <div className="trust-label">Active Landlords</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        {/* Recent Bookings */}
        <div className="dashboard-section recent-bookings-section">
          <div className="section-title-row">
            <h3>Recent Booking Requests</h3>
            <a href="/admin/bookings" className="view-all-link">View All →</a>
          </div>
          {recentBookings.length === 0 ? (
            <div className="empty-state">
              <span>📅</span>
              <p>No recent bookings</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="table-wrapper desktop-only">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Guest Name</th>
                      <th>Property</th>
                      <th>Check-in</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id}>
                        <td className="booking-id">#{booking.id}</td>
                        <td>
                          <div className="guest-cell">
                            <span>{booking.guest_name || 'Anonymous User'}</span>
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

              {/* Mobile Card View */}
              <div className="mobile-bookings-list mobile-only">
                {recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="mobile-booking-card">
                    <div className="mobile-booking-header">
                      <span className="booking-id">#{booking.id}</span>
                      <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
                    </div>
                    <div className="mobile-booking-body">
                      <div className="mobile-booking-row">
                        <span className="mobile-booking-label">Guest</span>
                        <span className="mobile-booking-value">{booking.guest_name || 'Anonymous User'}</span>
                      </div>
                      <div className="mobile-booking-row">
                        <span className="mobile-booking-label">Property</span>
                        <span className="mobile-booking-value">{booking.property_title ? booking.property_title.substring(0, 25) + '...' : 'N/A'}</span>
                      </div>
                      <div className="mobile-booking-row">
                        <span className="mobile-booking-label">Check-in</span>
                        <span className="mobile-booking-value">{new Date(booking.check_in_date).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="mobile-booking-row">
                        <span className="mobile-booking-label">Amount</span>
                        <span className="mobile-booking-value amount-cell">₹{Number(booking.total_amount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="dashboard-section quick-stats-section">
          <div className="section-title-row">
            <h3>System Administration</h3>
          </div>
          
          <div className="quick-actions">
            <a href="/admin/properties" className="qa-btn qa-green">
              🏠 Verify Property Submissions
            </a>
            <a href="/admin/users" className="qa-btn qa-blue">
              👥 Manage Users & Blocklist
            </a>
            <a href="/admin/bookings" className="qa-btn qa-purple">
              📅 Manage Rental Bookings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;