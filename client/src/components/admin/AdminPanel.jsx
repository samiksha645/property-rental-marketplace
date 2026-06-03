import React, { useState, useEffect } from 'react';
import { propertyService, bookingService } from '../../services/api';
import './AdminPanel.css';

const AdminPanel = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'properties', 'bookings'
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state for creating a new property
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    square_feet: 500,
    max_guests: 2,
    base_price_per_night: 100,
    cleaning_fee: 30,
    security_deposit: 150,
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
    cancellation_policy: 'flexible',
    amenities: 'Wifi, Air Conditioning, Kitchen',
    images: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    is_featured: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const propertiesRes = await propertyService.getAllProperties({});
      const bookingsRes = await bookingService.getAllBookings();

      if (propertiesRes.success) {
        setProperties(propertiesRes.properties);
      } else {
        setError(propertiesRes.error || 'Failed to fetch properties');
      }

      if (bookingsRes.success) {
        setBookings(bookingsRes.bookings);
      } else {
        setError(prev => prev || bookingsRes.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred while fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (property) => {
    const updatedStatus = !property.is_active;
    const res = await propertyService.updateProperty(property.id, { is_active: updatedStatus });
    if (res.success) {
      setProperties(prev => prev.map(p => p.id === property.id ? { ...p, is_active: updatedStatus } : p));
      setSuccess(`Property "${property.title}" status updated successfully.`);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.error || 'Failed to update property status');
    }
  };

  const handleToggleFeatured = async (property) => {
    const updatedFeatured = !property.is_featured;
    const res = await propertyService.updateProperty(property.id, { is_featured: updatedFeatured });
    if (res.success) {
      setProperties(prev => prev.map(p => p.id === property.id ? { ...p, is_featured: updatedFeatured } : p));
      setSuccess(`Property "${property.title}" featured status updated.`);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.error || 'Failed to update property');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      const res = await propertyService.deleteProperty(propertyId);
      if (res.success) {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        setSuccess('Property deleted successfully.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.error || 'Failed to delete property');
      }
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    const res = await bookingService.confirmBooking(bookingId);
    if (res.success) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed', payment_status: 'paid' } : b));
      setSuccess('Booking confirmed and marked as paid.');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.error || 'Failed to confirm booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const reason = window.prompt('Please enter cancellation reason:', 'Cancelled by Admin');
      const res = await bookingService.cancelBooking(bookingId, reason);
      if (res.success) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled', cancellation_reason: reason } : b));
        setSuccess('Booking successfully cancelled.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.error || 'Failed to cancel booking');
      }
    }
  };

  const handleAddPropertySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Transform amenities and images into arrays
    const propertyData = {
      ...formData,
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseFloat(formData.bathrooms),
      square_feet: parseInt(formData.square_feet),
      max_guests: parseInt(formData.max_guests),
      base_price_per_night: parseFloat(formData.base_price_per_night),
      cleaning_fee: parseFloat(formData.cleaning_fee),
      security_deposit: parseFloat(formData.security_deposit),
      amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
      images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
    };

    const res = await propertyService.createProperty(propertyData);
    if (res.success) {
      setProperties(prev => [res.property, ...prev]);
      setSuccess('Property listed successfully!');
      setShowAddForm(false);
      // Reset form
      setFormData({
        title: '',
        description: '',
        property_type: 'apartment',
        bedrooms: 1,
        bathrooms: 1,
        square_feet: 500,
        max_guests: 2,
        base_price_per_night: 100,
        cleaning_fee: 30,
        security_deposit: 150,
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'USA',
        cancellation_policy: 'flexible',
        amenities: 'Wifi, Air Conditioning, Kitchen',
        images: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        is_featured: false,
      });
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(res.error || 'Failed to list property');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Dashboard Stats Calculations
  const stats = {
    totalProperties: properties.length,
    activeProperties: properties.filter(p => p.is_active).length,
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    totalRevenue: bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
    avgPrice: properties.reduce((sum, p) => sum + parseFloat(p.base_price_per_night || 0), 0) / (properties.length || 1),
  };

  return (
    <div className="admin-container">
      <div className="admin-header-row">
        <div className="admin-title-area">
          <h2>⚙️ Admin Control Panel</h2>
          <p className="admin-subtitle">Monitor site activity, manage active rentals, and control bookings.</p>
        </div>
        <button className="admin-back-btn" onClick={onBack}>
          ← Back to Site
        </button>
      </div>

      {/* Tabs bar */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          🏠 Manage Properties ({properties.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          📅 Manage Bookings ({bookings.length})
        </button>
      </div>

      {error && <div className="admin-alert error">⚠️ {error}</div>}
      {success && <div className="admin-alert success">✅ {success}</div>}

      {loading ? (
        <div className="admin-loader">
          <div className="admin-spinner"></div>
          <p>Loading Admin Dashboard...</p>
        </div>
      ) : (
        <div className="admin-content-area">
          {/* Tab 1: Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-grid">
              <div className="stat-card">
                <div className="stat-icon purple">💰</div>
                <div className="stat-content">
                  <h3>Total Gross Revenue</h3>
                  <p className="stat-value">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <span className="stat-desc">From all non-cancelled bookings</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon red">📅</div>
                <div className="stat-content">
                  <h3>Total Bookings</h3>
                  <p className="stat-value">{stats.totalBookings}</p>
                  <span className="stat-desc">{stats.confirmedBookings} confirmed bookings</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">🏡</div>
                <div className="stat-content">
                  <h3>Active Properties</h3>
                  <p className="stat-value">{stats.activeProperties} <span className="stat-total">/ {stats.totalProperties}</span></p>
                  <span className="stat-desc">Listed across all destinations</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon gold">⭐</div>
                <div className="stat-content">
                  <h3>Average Base Rent</h3>
                  <p className="stat-value">${stats.avgPrice.toFixed(0)} <span className="price-unit">/ night</span></p>
                  <span className="stat-desc">Across all rental inventories</span>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="admin-section-full glass-panel">
                <h3 className="section-title">⚡ Quick Management Actions</h3>
                <div className="quick-actions-row">
                  <button className="quick-action-btn purple" onClick={() => { setActiveTab('properties'); setShowAddForm(true); }}>
                    + Add New Property Listing
                  </button>
                  <button className="quick-action-btn border" onClick={fetchData}>
                    🔄 Refresh Real-Time Data
                  </button>
                </div>
              </div>

              {/* Recent Bookings Peek */}
              <div className="admin-section-full glass-panel">
                <h3 className="section-title">Recent Activity</h3>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Property</th>
                        <th>Dates</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map(b => (
                        <tr key={b.id}>
                          <td><strong>#BK-{b.id}</strong></td>
                          <td>{b.property_title}</td>
                          <td>
                            {new Date(b.check_in_date).toLocaleDateString()} - {new Date(b.check_out_date).toLocaleDateString()}
                          </td>
                          <td><strong className="text-purple">${b.total_amount}</strong></td>
                          <td>
                            <span className={`badge ${b.status}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center">No bookings recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Properties Management */}
          {activeTab === 'properties' && (
            <div className="admin-properties-tab">
              <div className="tab-actions-header">
                <h3>Rental Inventory List</h3>
                <button className="add-property-btn-main" onClick={() => setShowAddForm(!showAddForm)}>
                  {showAddForm ? 'Close Listing Form' : '+ Add New Property'}
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddPropertySubmit} className="admin-property-form glass-panel">
                  <h3>✨ List A New Premium Property</h3>
                  
                  <div className="form-grid">
                    <div className="form-group col-2">
                      <label>Property Title</label>
                      <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Luxury Beachside Villa with Infinity Pool" 
                        required 
                      />
                    </div>

                    <div className="form-group col-2">
                      <label>Description</label>
                      <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleInputChange} 
                        placeholder="Detailed description of the property, neighborhood, amenities..." 
                        rows="3" 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label>Property Type</label>
                      <select name="property_type" value={formData.property_type} onChange={handleInputChange}>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="condo">Condo</option>
                        <option value="studio">Studio</option>
                        <option value="townhouse">Townhouse</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Bedrooms</label>
                      <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} min="0" required />
                    </div>

                    <div className="form-group">
                      <label>Bathrooms</label>
                      <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} step="0.5" min="0" required />
                    </div>

                    <div className="form-group">
                      <label>Max Guests</label>
                      <input type="number" name="max_guests" value={formData.max_guests} onChange={handleInputChange} min="1" required />
                    </div>

                    <div className="form-group">
                      <label>Base Price / Night ($)</label>
                      <input type="number" name="base_price_per_night" value={formData.base_price_per_night} onChange={handleInputChange} min="1" required />
                    </div>

                    <div className="form-group">
                      <label>Cleaning Fee ($)</label>
                      <input type="number" name="cleaning_fee" value={formData.cleaning_fee} onChange={handleInputChange} min="0" required />
                    </div>

                    <div className="form-group">
                      <label>Security Deposit ($)</label>
                      <input type="number" name="security_deposit" value={formData.security_deposit} onChange={handleInputChange} min="0" required />
                    </div>

                    <div className="form-group">
                      <label>Square Feet</label>
                      <input type="number" name="square_feet" value={formData.square_feet} onChange={handleInputChange} min="1" required />
                    </div>

                    <div className="form-group">
                      <label>Address Line 1</label>
                      <input type="text" name="address_line1" value={formData.address_line1} onChange={handleInputChange} placeholder="e.g. 123 Paradise Blvd" required />
                    </div>

                    <div className="form-group">
                      <label>Address Line 2 (Opt)</label>
                      <input type="text" name="address_line2" value={formData.address_line2} onChange={handleInputChange} placeholder="e.g. Suite 302" />
                    </div>

                    <div className="form-group">
                      <label>City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                      <label>State</label>
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                      <label>Postal Code</label>
                      <input type="text" name="postal_code" value={formData.postal_code} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group col-2">
                      <label>Amenities (Comma-separated)</label>
                      <input type="text" name="amenities" value={formData.amenities} onChange={handleInputChange} placeholder="e.g. Wifi, Air Conditioning, Pool, Kitchen, Beachfront" required />
                    </div>

                    <div className="form-group col-2">
                      <label>Images URL (Comma-separated for multiple)</label>
                      <input type="text" name="images" value={formData.images} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group checkbox col-2">
                      <input 
                        type="checkbox" 
                        id="is_featured" 
                        name="is_featured" 
                        checked={formData.is_featured} 
                        onChange={handleInputChange} 
                      />
                      <label htmlFor="is_featured">⭐ Feature this property on homepage</label>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="form-submit-btn">Add Property Listing</button>
                    <button type="button" className="form-cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="table-responsive glass-panel">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title & Location</th>
                      <th>Type</th>
                      <th>Rent / Night</th>
                      <th>Featured</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map(p => (
                      <tr key={p.id}>
                        <td>
                          <img 
                            src={p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=150&q=80'} 
                            alt={p.title} 
                            className="admin-property-thumb" 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=150&q=80';
                            }}
                          />
                        </td>
                        <td>
                          <div className="admin-property-title-cell">
                            <strong>{p.title}</strong>
                            <span>📍 {p.city}, {p.state}</span>
                          </div>
                        </td>
                        <td>
                          <span className="property-type">{p.property_type}</span>
                        </td>
                        <td>
                          <strong>${parseFloat(p.base_price_per_night).toFixed(0)}</strong>
                        </td>
                        <td>
                          <button 
                            className={`admin-toggle-btn ${p.is_featured ? 'gold' : ''}`}
                            onClick={() => handleToggleFeatured(p)}
                          >
                            {p.is_featured ? '★ Featured' : '☆ Standard'}
                          </button>
                        </td>
                        <td>
                          <button 
                            className={`admin-toggle-btn ${p.is_active ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleActive(p)}
                          >
                            {p.is_active ? '🟢 Active' : '🔴 Hidden'}
                          </button>
                        </td>
                        <td>
                          <button className="admin-delete-btn" onClick={() => handleDeleteProperty(p.id)}>
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Bookings Management */}
          {activeTab === 'bookings' && (
            <div className="admin-bookings-tab">
              <h3>System Booking Transactions</h3>
              
              <div className="table-responsive glass-panel">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Guest Details</th>
                      <th>Property Title</th>
                      <th>Stay Period</th>
                      <th>Amount Charged</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td><strong>#BK-{b.id}</strong></td>
                        <td>
                          <div className="guest-info-cell">
                            <strong>User #{b.guest_id}</strong>
                            <span>{b.guest_count} Guest{b.guest_count > 1 ? 's' : ''}</span>
                          </div>
                        </td>
                        <td>
                          <span className="booking-prop-title">{b.property_title}</span>
                        </td>
                        <td>
                          <div className="stay-period-cell">
                            <strong>{new Date(b.check_in_date).toLocaleDateString()} - {new Date(b.check_out_date).toLocaleDateString()}</strong>
                            <span>
                              ({Math.ceil((new Date(b.check_out_date) - new Date(b.check_in_date)) / (1000 * 60 * 60 * 24))} Nights)
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="amount-cell">
                            <strong>${b.total_amount}</strong>
                            <span className="payment-status-tag">{b.payment_status}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${b.status}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-cell">
                            {b.status === 'pending' && (
                              <button className="action-confirm-btn" onClick={() => handleConfirmBooking(b.id)}>
                                Approve
                              </button>
                            )}
                            {b.status !== 'cancelled' && (
                              <button className="action-cancel-btn" onClick={() => handleCancelBooking(b.id)}>
                                Cancel
                              </button>
                            )}
                            {b.status === 'cancelled' && (
                              <span className="cancelled-reason-text" title={b.cancellation_reason}>
                                Reason: {b.cancellation_reason || 'N/A'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center">No active bookings listed in the system yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
