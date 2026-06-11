import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/api';

const UserDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const result = await bookingService.getUserBookings(1, 20, token);
      if (result.success) {
        setBookings(result.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
    setLoading(false);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    const result = await bookingService.cancelBooking(bookingId, 'User requested cancellation', token);
    if (result.success) {
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <h1>My Dashboard</h1>
        <p>Welcome back, {user?.name || 'User'}!</p>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card" style={{ background: '#dbeafe', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 8px', color: '#1e40af' }}>Total Bookings</h3>
          <p style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>{bookings.length}</p>
        </div>
        <div className="stat-card" style={{ background: '#d1fae5', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 8px', color: '#065f46' }}>Active</h3>
          <p style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>{bookings.filter(b => b.status === 'confirmed' || b.status === 'active').length}</p>
        </div>
        <div className="stat-card" style={{ background: '#fef3c7', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 8px', color: '#92400e' }}>Pending</h3>
          <p style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>{bookings.filter(b => b.status === 'pending').length}</p>
        </div>
      </div>

      <div className="dashboard-section" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <h2 style={{ padding: '20px 20px 0', margin: '0 0 20px' }}>My Bookings</h2>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>No bookings yet</p>
            <button className="btn btn-primary" onClick={() => navigate('/properties')}>
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>Property</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>Check-in</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>Check-out</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>Total</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{booking.property_title || `Property #${booking.property_id}`}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{new Date(booking.check_in_date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{new Date(booking.check_out_date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                      <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>₹{Number(booking.total_amount || 0).toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                      {booking.status === 'pending' && (
                        <button className="cancel-btn" onClick={() => handleCancelBooking(booking.id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;