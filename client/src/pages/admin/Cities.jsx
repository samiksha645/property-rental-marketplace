import React, { useState, useEffect } from 'react';
import { adminService, API_BASE_URL } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './AdminCommon.css';

const Cities = () => {
  const { token } = useAuth();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', state: '', slug: '', is_popular: false });

  useEffect(() => { loadCities(); }, []);

  const loadCities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cities`);
      const data = await response.json();
      if (data.success) {
        setCities(data.data);
      } else {
        setError('Failed to load cities');
      }
    } catch (err) {
      setError('Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', state: '', slug: '', is_popular: false });
    setShowModal(true);
  };

  const openEdit = (city) => {
    setEditing(city);
    setForm({ name: city.name, state: city.state, slug: city.slug, is_popular: city.is_popular });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!form.name || !form.state || !form.slug) {
        alert('Name, state, and slug are required');
        return;
      }
      let result;
      if (editing) {
        result = await adminService.updateCity(token, editing.id, form);
      } else {
        result = await adminService.createCity(token, form);
      }
      if (result.success) {
        setShowModal(false);
        loadCities();
      } else {
        alert(result.error || 'Failed to save city');
      }
    } catch (err) {
      alert('Failed to save city');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this city?')) return;
    try {
      const result = await adminService.deleteCity(token, id);
      if (result.success) {
        setCities(cities.filter(c => c.id !== id));
      } else {
        alert(result.error || 'Failed to delete city');
      }
    } catch (err) {
      alert('Failed to delete city');
    }
  };

  if (loading) {
    return <div className="admin-page-loading"><div className="spinner"></div><p>Loading cities...</p></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Cities Management</h1>
          <p>{cities.length} cities</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add City</button>
      </div>

      {error && (
        <div className="admin-error-msg">
          {error}
          <button onClick={loadCities}>Retry</button>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>State</th>
              <th>Slug</th>
              <th>Popular</th>
              <th>Properties</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cities.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No cities found
                </td>
              </tr>
            ) : cities.map((city) => (
              <tr key={city.id}>
                <td className="id-cell">#{city.id}</td>
                <td><strong>{city.name}</strong></td>
                <td>{city.state}</td>
                <td><code>{city.slug}</code></td>
                <td>
                  <span className={`status-badge ${city.is_popular ? 'status-confirmed' : 'status-cancelled'}`}>
                    {city.is_popular ? 'Popular' : 'Normal'}
                  </span>
                </td>
                <td>{city.total_properties || 0}</td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => openEdit(city)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(city.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit City' : 'Add City'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>City Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Delhi" />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. Delhi" />
                </div>
                <div className="form-group">
                  <label>Slug *</label>
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. delhi" />
                </div>
                <div className="form-group">
                  <label>Popular</label>
                  <select value={form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.value === 'true' })}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cities;