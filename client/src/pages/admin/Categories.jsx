import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './AdminCommon.css';

const Categories = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '', sort_order: 0 });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', icon: '', sort_order: 0 });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', icon: cat.icon || '', sort_order: cat.sort_order || 0 });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!form.name || !form.slug) {
        alert('Name and slug are required');
        return;
      }
      let result;
      if (editing) {
        result = await adminService.updateCategory(token, editing.id, form);
      } else {
        result = await adminService.createCategory(token, form);
      }
      if (result.success) {
        setShowModal(false);
        loadCategories();
      } else {
        alert(result.error || 'Failed to save category');
      }
    } catch (err) {
      alert('Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const result = await adminService.deleteCategory(token, id);
      if (result.success) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        alert(result.error || 'Failed to delete category');
      }
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  if (loading) {
    return <div className="admin-page-loading"><div className="spinner"></div><p>Loading categories...</p></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Categories Management</h1>
          <p>{categories.length} categories</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add Category</button>
      </div>

      {error && (
        <div className="admin-error-msg">
          {error}
          <button onClick={loadCategories}>Retry</button>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Icon</th>
              <th>Sort Order</th>
              <th>Properties</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No categories found
                </td>
              </tr>
            ) : categories.map((cat) => (
              <tr key={cat.id}>
                <td className="id-cell">#{cat.id}</td>
                <td><strong>{cat.name}</strong></td>
                <td><code>{cat.slug}</code></td>
                <td>{cat.icon || '—'}</td>
                <td>{cat.sort_order}</td>
                <td>{cat.total_properties || 0}</td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => openEdit(cat)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(cat.id)}>Delete</button>
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
              <h2>{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Apartment" />
              </div>
              <div className="form-group">
                <label>Slug *</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. apartment" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="form-group">
                <label>Icon</label>
                <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. building" />
              </div>
              <div className="form-group">
                <label>Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
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

export default Categories;