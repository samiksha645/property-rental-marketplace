import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './AdminCommon.css';

const formatPrice = (price) => {
  if (!price) return '₹0';
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
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
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadProperties();
  }, [currentPage]);

  const loadProperties = async () => {
    setLoading(true);
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
    if (!window.confirm('Delete this property? This action cannot be undone.')) return;
    try {
      const result = await adminService.deleteProperty(token, propertyId);
      if (result.success) {
        setProperties(properties.filter(p => p.id !== propertyId));
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

  const handleToggleStatus = async (property, field) => {
    const updates = { [field]: !property[field] };
    try {
      const result = await adminService.updateProperty(token, property.id, updates);
      if (result.success) {
        setProperties(properties.map(p => p.id === property.id ? { ...p, ...updates } : p));
      } else {
        alert(result.error || 'Update failed');
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const result = await adminService.updateProperty(token, editingProperty.id, editingProperty);
      if (result.success) {
        setProperties(properties.map(p => p.id === editingProperty.id ? { ...p, ...result.property } : p));
        setShowModal(false);
        setEditingProperty(null);
      } else {
        alert(result.error || 'Failed to update property');
      }
    } catch (err) {
      alert('Failed to update property');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const filteredProperties = search
    ? properties.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.city?.toLowerCase().includes(search.toLowerCase()) ||
        String(p.id).includes(search)
      )
    : properties;

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="spinner"></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Property Management</h1>
          <p>{pagination?.total || 0} total properties</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by title, city, or ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
          />
          <button onClick={() => setSearch(searchInput)}>Search</button>
          {search && <button onClick={() => { setSearch(''); setSearchInput(''); }} className="clear-btn">✕ Clear</button>}
        </div>
      </div>

      {error && (
        <div className="admin-error-msg">
          {error}
          <button onClick={loadProperties}>Retry</button>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Property</th>
              <th>Type</th>
              <th>City</th>
              <th>Rent/mo</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Flags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No properties found
                </td>
              </tr>
            ) : filteredProperties.map((property) => (
              <tr key={property.id}>
                <td className="id-cell">#{property.id}</td>
                <td>
                  <div className="property-name-cell">
                    <span className="property-title-text">{property.title}</span>
                    <span className="property-locality">{property.locality}</span>
                  </div>
                </td>
                <td>
                  <span className="type-badge">{property.property_type?.replace('-', ' ')}</span>
                </td>
                <td>{property.city}</td>
                <td className="rent-cell">{formatPrice(property.monthly_rent)}</td>
                <td>{property.landlord_name || property.owner_name || 'N/A'}</td>
                <td>
                  <span className={`status-badge status-${property.is_active ? 'confirmed' : 'cancelled'}`}>
                    {property.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="flag-badges">
                    <button
                      className={`flag-btn ${property.is_verified ? 'flag-verified' : 'flag-off'}`}
                      onClick={() => handleToggleStatus(property, 'is_verified')}
                      title="Toggle verified"
                    >
                      ✓ {property.is_verified ? 'Verified' : 'Unverified'}
                    </button>
                    <button
                      className={`flag-btn ${property.is_featured ? 'flag-featured' : 'flag-off'}`}
                      onClick={() => handleToggleStatus(property, 'is_featured')}
                      title="Toggle featured"
                    >
                      ★ {property.is_featured ? 'Featured' : 'Feature'}
                    </button>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(property)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(property.id)}>Delete</button>
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
          <span>Page {currentPage} of {pagination.totalPages} ({pagination.total} total)</span>
          <button disabled={currentPage === pagination.totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next →</button>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editingProperty && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Property</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" name="title" value={editingProperty.title || ''} onChange={(e) => setEditingProperty(prev => ({ ...prev, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Property Type</label>
                  <select name="property_type" value={editingProperty.property_type || ''} onChange={(e) => setEditingProperty(prev => ({ ...prev, property_type: e.target.value }))}>
                    <option value="apartment">Apartment</option>
                    <option value="flat">Flat</option>
                    <option value="villa">Villa</option>
                    <option value="independent-house">Independent House</option>
                    <option value="studio">Studio Apartment</option>
                    <option value="pg-hostel">PG</option>
                    <option value="builder-floor">Builder Floor</option>
                    <option value="farmhouse">Farm House</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="office">Office</option>
                    <option value="shop">Shop</option>
                    <option value="warehouse">Warehouse</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Monthly Rent (₹)</label>
                  <input type="number" name="monthly_rent" value={editingProperty.monthly_rent || ''} onChange={(e) => setEditingProperty(prev => ({ ...prev, monthly_rent: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Security Deposit (₹)</label>
                  <input type="number" name="security_deposit" value={editingProperty.security_deposit || ''} onChange={(e) => setEditingProperty(prev => ({ ...prev, security_deposit: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" value={editingProperty.city || ''} onChange={(e) => setEditingProperty(prev => ({ ...prev, city: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Locality</label>
                  <input type="text" name="locality" value={editingProperty.locality || ''} onChange={(e) => setEditingProperty(prev => ({ ...prev, locality: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Bedrooms</label>
                  <input type="number" name="bedrooms" value={editingProperty.bedrooms || ''} onChange={(e) => setEditingProperty(prev => ({ ...prev, bedrooms: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Furnishing</label>
                  <select name="furnishing" value={editingProperty.furnishing || ''} onChange={(e) => setEditingProperty(prev => ({ ...prev, furnishing: e.target.value }))}>
                    <option value="fully-furnished">Fully Furnished</option>
                    <option value="semi-furnished">Semi Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Active Status</label>
                <select name="is_active" value={editingProperty.is_active} onChange={(e) => setEditingProperty(prev => ({ ...prev, is_active: e.target.value === 'true' }))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;