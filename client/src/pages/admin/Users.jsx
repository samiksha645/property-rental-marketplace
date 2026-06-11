import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './AdminCommon.css';

const Users = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await adminService.getAllUsers(token, currentPage, 20, searchTerm);
      if (result.success) {
        setUsers(result.users);
        setPagination(result.pagination);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;
    try {
      const result = await adminService.deleteUser(token, userId);
      if (result.success) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert(result.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>User Management</h1>
          <p>{pagination?.total || 0} total users</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit">Search</button>
          {searchTerm && (
            <button type="button" onClick={() => { setSearchTerm(''); setSearchInput(''); }} className="clear-btn">
              ✕ Clear
            </button>
          )}
        </form>
      </div>

      {error && (
        <div className="admin-error-msg">
          {error}
          <button onClick={loadUsers}>Retry</button>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No users found
                </td>
              </tr>
            ) : users.map((user) => (
              <tr key={user.id}>
                <td className="id-cell">#{user.id}</td>
                <td>
                  <div className="person-cell">
                    <div className="person-avatar" style={{ background: user.role === 'admin' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      {(user.name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="person-name">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="person-email">{user.email}</td>
                <td>{user.phone || '—'}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'status-confirmed' : 'status-cancelled'}`}>
                    {user.is_active ? 'Active' : 'Blocked'}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>
                  <div className="action-buttons">
                    {user.role !== 'admin' && user.id !== currentUser?.id && (
                      <>
                        <button 
                          className={`${user.is_active ? 'cancel-btn' : 'confirm-btn'}`}
                          onClick={async () => {
                            const result = await adminService.toggleUserStatus(token, user.id);
                            if (result.success) {
                              setUsers(users.map(u => u.id === user.id ? { ...u, is_active: result.is_active } : u));
                            } else {
                              alert(result.error || 'Failed to toggle status');
                            }
                          }}
                        >
                          {user.is_active ? 'Block' : 'Activate'}
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(user.id)}>
                          Delete
                        </button>
                      </>
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
          <span>Page {currentPage} of {pagination.totalPages} ({pagination.total} users)</span>
          <button disabled={currentPage === pagination.totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default Users;