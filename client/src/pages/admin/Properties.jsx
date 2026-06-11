import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './AdminCommon.css';

const formatPrice = (price) => {
  if (!price) return '₹0';
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(1)}K`;
  return `₹${price}`;
};

const Properties = () => {
  const { token } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadProperties();
  }, [currentPage]);

  const loadProperties = async () => {
    try {
      const result = await adminService.getAllProperties(token, currentPage, 20);
      if (result.success) {
        setProperties(result.properties);
        setPagination(result.pagination);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;

    try {
      const result = await adminService.deleteProperty(token, propertyId);
      if (result.success) {
        setProperties(properties.filter(p => p.id !== propertyId));
        alert('Property deleted successfully');
      } else {
        alert(result.error || 'Failed to delete property');
      }
    } catch (err) {
      alert('Failed to delete property');
    }
  };

  const handleEdit = (property) => {
    setEditingProperty({ ...property });
    setShowModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const result = await adminService.updateProperty(token, editingProperty.id, editingProperty);
      if (result.success) {
        setProperties(properties.map(p => p.id === editingProperty.id ? { ...p, ...result.property } : p));
        setShowModal(false);
        setEditingProperty(null);
        alert('Property updated successfully');
      } else {
        alert(result.error || 'Failed to update property');
      }
    } catch (err) {
      alert('Failed to update property');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProperty(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading properties...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Property Management</h1>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={loadProperties}>Retry</button>
          </div>
        )}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Location</th>
                <th>Monthly Rent</th>
                <th>Landlord</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id}>
                  <td>#{property.id}</td>
                  <td>{property.title}</td>
                  <td>{property.property_type}</td>
                  <td>{property.city}, {property.state}</td>
                  <td>{formatPrice(property.monthly_rent)}/mo</td>
                  <td>{property.landlord_name || property.owner_name || 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-${property.is_active ? 'active' : 'inactive'}`}>
                      {property.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(property)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(property.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            <span>Page {currentPage} of {pagination.totalPages}</span>
            <button
              disabled={currentPage === pagination.totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {showModal && editingProperty && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Edit Property</h2>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={editingProperty.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Monthly Rent (₹)</label>
                <input
                  type="number"
                  name="monthly_rent"
                  value={editingProperty.monthly_rent}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={editingProperty.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={editingProperty.state}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Active</label>
                <select
                  name="is_active"
                  value={editingProperty.is_active}
                  onChange={(e) => setEditingProperty(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                >
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowModal(false)}>Cancel</button>
                <button className="primary" onClick={handleSaveEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Properties;