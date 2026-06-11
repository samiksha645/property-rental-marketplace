import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './AdminCommon.css';

const Bookings = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadBookings();
  }, [currentPage, statusFilter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const result = await adminService.getAllBookings(token, currentPage, 20, statusFilter);
      if (result.success) {
        setBookings(result.bookings);
        setPagination(result.pagination);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    if (!window.confirm(`Mark this booking as ${newStatus}?`)) return;
    try {
      const result = await adminService.updateBookingStatus(token, bookingId, newStatus);
      if (result.success) {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      } else {
        alert(result.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Booking Management</h1>
          <p>{pagination?.total || 0} total bookings</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="status-filter-group">
          {['', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="admin-error-msg">
          {error}
          <button onClick={loadBookings}>Retry</button>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Guest</th>
              <th>Property</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No bookings found
                </td>
              </tr>
            ) : bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="id-cell">#{booking.id}</td>
                <td>
                  <div className="person-cell">
                    <div className="person-avatar">{(booking.guest_name || 'U')[0]}</div>
                    <div>
                      <div className="person-name">{booking.guest_name || 'N/A'}</div>
                      <div className="person-email">{booking.guest_email || ''}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="property-name-cell">
                    <span className="property-title-text">{booking.property_title || 'N/A'}</span>
                  </div>
                </td>
                <td>{new Date(booking.check_in_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>{new Date(booking.check_out_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="rent-cell">₹{Number(booking.total_amount || 0).toLocaleString()}</td>
                <td>{booking.owner_name || 'N/A'}</td>
                <td>
                  <div className="action-buttons">
                    {booking.status === 'pending' && (
                      <button
                        className="confirm-btn"
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                      >
                        ✓ Confirm
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        className="active-btn"
                        onClick={() => handleStatusChange(booking.id, 'active')}
                      >
                        ▶ Active
                      </button>
                    )}
                    {booking.status === 'active' && (
                      <button
                        className="complete-btn"
                        onClick={() => handleStatusChange(booking.id, 'completed')}
                      >
                        ✓ Complete
                      </button>
                    )}
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button
                        className="cancel-btn"
                        onClick={() => handleStatusChange(booking.id, 'cancelled')}
                      >
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>← Previous</button>
          <span>Page {currentPage} of {pagination.totalPages}</span>
          <button disabled={currentPage === pagination.totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default Bookings;