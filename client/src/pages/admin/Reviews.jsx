import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './AdminCommon.css';

const Reviews = () => {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { loadReviews(); }, [currentPage]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const result = await adminService.getAllReviews(token, currentPage, 20);
      if (result.success) {
        setReviews(result.reviews);
        setPagination(result.pagination);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const result = await adminService.deleteReview(token, reviewId);
      if (result.success) {
        setReviews(reviews.filter(r => r.id !== reviewId));
      } else {
        alert(result.error || 'Failed to delete review');
      }
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  if (loading) {
    return <div className="admin-page-loading"><div className="spinner"></div><p>Loading reviews...</p></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Reviews Management</h1>
          <p>{pagination?.total || 0} total reviews</p>
        </div>
      </div>

      {error && (
        <div className="admin-error-msg">
          {error}
          <button onClick={loadReviews}>Retry</button>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Property</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No reviews found
                </td>
              </tr>
            ) : reviews.map((review) => (
              <tr key={review.id}>
                <td className="id-cell">#{review.id}</td>
                <td>
                  <div className="person-cell">
                    <div className="person-avatar">{(review.user_name || 'U')[0]}</div>
                    <div>
                      <div className="person-name">{review.user_name}</div>
                      <div className="person-email">{review.user_email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="property-name-cell">
                    <span className="property-title-text">{review.property_title || 'N/A'}</span>
                    {review.city && <span className="property-locality">{review.city}</span>}
                  </div>
                </td>
                <td>
                  <span className="rating-badge">{'⭐'.repeat(review.rating || 0)}</span>
                </td>
                <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {review.comment || '—'}
                </td>
                <td>{new Date(review.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>
                  <div className="action-buttons">
                    <button className="delete-btn" onClick={() => handleDelete(review.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Previous</button>
          <span>Page {currentPage} of {pagination.totalPages}</span>
          <button disabled={currentPage === pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default Reviews;