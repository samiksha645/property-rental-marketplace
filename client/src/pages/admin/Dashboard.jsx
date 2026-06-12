import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const StatCard = ({ title, value, icon, color, trend }) => (
  <div className={`stat-card stat-${color}`} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
    <div className="stat-icon-box" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: `var(--${color}-50 || #f1f5f9)` }}>{icon}</div>
    <div className="stat-info">
      <p className="stat-label" style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>{title}</p>
      <h3 className="stat-value" style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{value}</h3>
      {trend && <span className="stat-trend" style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>{trend}</span>}
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
      <div className="dashboard-loading" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ display: 'inline-block' }}></div>
        <p style={{ marginTop: '16px', color: '#64748b' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error" style={{ padding: '80px 20px', textAlign: 'center' }}>
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
    <div className="dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="dashboard-greeting">
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>Admin Dashboard Panel</h2>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Real-time analytics, user control, and property rental verifications.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Category Share Chart */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Category Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span>Apartments & Flats</span>
                <strong>65%</strong>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: '#2563eb' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span>Villas & Independent Houses</span>
                <strong>20%</strong>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '20%', height: '100%', background: '#10b981' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span>PG & Shared Rooms</span>
                <strong>15%</strong>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '15%', height: '100%', background: '#8b5cf6' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Analytics */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Property Trust Analytics</h3>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'space-around', height: '100px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#059669' }}>
                {stats?.totalProperties ? Math.round((stats.activeProperties / stats.totalProperties) * 100) : 100}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Verified Properties</div>
            </div>
            <div style={{ width: '1px', height: '60px', background: '#e2e8f0' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2563eb' }}>
                {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 100}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Active Landlords</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        {/* Recent Bookings */}
        <div className="dashboard-section recent-bookings-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div className="section-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Recent Booking Requests</h3>
            <a href="/admin/bookings" className="view-all-link" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>View All →</a>
          </div>
          {recentBookings.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
              <span>📅</span>
              <p>No recent bookings</p>
            </div>
          ) : (
            <div className="table-wrapper">
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
                      <td className="amount-cell" style={{ fontWeight: '600' }}>₹{Number(booking.total_amount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="dashboard-section quick-stats-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div className="section-title-row" style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>System Administration</h3>
          </div>
          
          <div className="quick-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="/admin/properties" className="qa-btn qa-green" style={{ padding: '12px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', textAlign: 'center' }}>
              🏠 Verify Property Submissions
            </a>
            <a href="/admin/users" className="qa-btn qa-blue" style={{ padding: '12px', background: '#dbeafe', color: '#1e40af', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', textAlign: 'center' }}>
              👥 Manage Users & Blocklist
            </a>
            <a href="/admin/bookings" className="qa-btn qa-purple" style={{ padding: '12px', background: '#f3e8ff', color: '#6b21a8', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', textAlign: 'center' }}>
              📅 Manage Rental Bookings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;