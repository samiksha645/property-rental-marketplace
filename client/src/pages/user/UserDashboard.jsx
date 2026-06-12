import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService, propertyService } from '../../services/api';
import { authService, API_BASE_URL } from '../../services/authService';
import PropertyCard from '../../components/property/PropertyCard';
import AddPropertyForm from '../../components/property/AddPropertyForm';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user, token, updateUserInfo } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard Tab state
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Bookings list state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  
  // Wishlist list state
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // My Properties (Landlord listings) state
  const [myProperties, setMyProperties] = useState([]);
  const [loadingMyProperties, setLoadingMyProperties] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  
  // Profile edit forms state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profile_image: user?.profile_image || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  
  // Status message alerts
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (activeTab === 'wishlist') {
      loadWishlist();
    } else if (activeTab === 'listings') {
      loadMyProperties();
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        profile_image: user.profile_image || ''
      });
    }
  }, [user]);

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const result = await bookingService.getUserBookings(1, 20, token);
      if (result.success) {
        setBookings(result.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
    setLoadingBookings(false);
  };

  const loadWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setWishlistItems(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
    setLoadingWishlist(false);
  };

  const loadMyProperties = async () => {
    if (!user?.id) return;
    setLoadingMyProperties(true);
    try {
      // Find all active properties listed by this owner
      const res = await propertyService.getAllProperties({ owner_id: user.id });
      if (res.success) {
        setMyProperties(res.properties);
      }
    } catch (err) {
      console.error('Failed to load my properties:', err);
    }
    setLoadingMyProperties(false);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const result = await bookingService.cancelBooking(bookingId, 'User requested cancellation', token);
      if (result.success) {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
        alert('Booking cancelled successfully!');
      } else {
        alert(result.error || 'Failed to cancel booking');
      }
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  const handleRemoveWishlist = async (propertyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setWishlistItems(wishlistItems.filter(item => item.property_id !== propertyId));
      }
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property listing? This action cannot be undone.')) return;
    try {
      const res = await propertyService.deleteProperty(propertyId, token);
      if (res.success) {
        setMyProperties(myProperties.filter(p => p.id !== propertyId));
        alert('Property deleted successfully!');
      } else {
        alert(res.error || 'Failed to delete property');
      }
    } catch (err) {
      alert('Error deleting property');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    setProfileMessage({ type: '', text: '' });
    
    try {
      const result = await authService.updateProfile(token, profileForm);
      if (result.success) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        if (updateUserInfo) {
          updateUserInfo(result.user);
        }
      } else {
        setProfileMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (err) {
      setProfileMessage({ type: 'error', text: 'Failed to update profile' });
    }
    setSubmittingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSubmittingPassword(true);
    setPasswordMessage({ type: '', text: '' });
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      setSubmittingPassword(false);
      return;
    }
    
    try {
      const result = await authService.updatePassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (result.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMessage({ type: 'error', text: result.error || 'Failed to change password' });
      }
    } catch (err) {
      setPasswordMessage({ type: 'error', text: 'Failed to change password' });
    }
    setSubmittingPassword(false);
  };

  return (
    <div className="user-dashboard-container">
      <div className="container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-title">
            <h1>My Dashboard</h1>
            <p>Manage your bookings, wishlist, listed properties and profile details</p>
          </div>
          
          <div className="dashboard-tabs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
            <button 
              className={`dashboard-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('bookings'); setShowAddForm(false); setEditingProperty(null); }}
            >
              📅 My Bookings
            </button>
            <button 
              className={`dashboard-tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('listings'); setShowAddForm(false); setEditingProperty(null); }}
            >
              🏢 My Listings
            </button>
            <button 
              className={`dashboard-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => { setActiveTab('wishlist'); setShowAddForm(false); setEditingProperty(null); }}
            >
              ❤️ Wishlist
            </button>
            <button 
              className={`dashboard-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => { setActiveTab('profile'); setShowAddForm(false); setEditingProperty(null); }}
            >
              👤 Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Row (Visible for bookings tab) */}
        {activeTab === 'bookings' && (
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon-wrapper bookings">📅</div>
              <div className="stat-info">
                <span className="stat-label">Total Bookings</span>
                <span className="stat-value">{bookings.length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper active">✓</div>
              <div className="stat-info">
                <span className="stat-label">Confirmed / Active</span>
                <span className="stat-value">
                  {bookings.filter(b => b.status === 'confirmed' || b.status === 'active').length}
                </span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper pending">⏳</div>
              <div className="stat-info">
                <span className="stat-label">Pending Approval</span>
                <span className="stat-value">{bookings.filter(b => b.status === 'pending').length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Contents */}
        {activeTab === 'bookings' && (
          <div className="dashboard-section-card">
            <h2>My Bookings</h2>
            {loadingBookings ? (
              <div style={{ padding: '40px', textAlign: 'center' }} className="spinner"></div>
            ) : bookings.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🔑</span>
                <h3>You haven't booked any property yet</h3>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>Explore premium verified listings and book your home today!</p>
                <button className="btn btn-primary" onClick={() => navigate('/properties')}>
                  Browse Properties
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>City</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Status</th>
                      <th>Rent Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id}>
                        <td>
                          <Link to={`/property/${booking.property_id}`} style={{ fontWeight: '600', color: 'var(--primary)', textDecoration: 'none' }}>
                            {booking.property_title || `Property #${booking.property_id}`}
                          </Link>
                        </td>
                        <td>{booking.city || '—'}</td>
                        <td>{new Date(booking.check_in_date).toLocaleDateString()}</td>
                        <td>{new Date(booking.check_out_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          ₹{Number(booking.total_amount || 0).toLocaleString()}
                        </td>
                        <td>
                          {booking.status === 'pending' && (
                            <button className="cancel-action-btn" onClick={() => handleCancelBooking(booking.id)}>
                              Cancel Request
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* My Listed Properties Tab */}
        {activeTab === 'listings' && (
          <div className="dashboard-section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h2>My Listed Properties</h2>
              {!showAddForm && !editingProperty && (
                <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                  + Add New Listing
                </button>
              )}
            </div>

            {showAddForm && (
              <AddPropertyForm 
                onCancel={() => setShowAddForm(false)} 
                onPropertyAdded={(p) => {
                  setShowAddForm(false);
                  loadMyProperties();
                }}
              />
            )}

            {editingProperty && (
              <AddPropertyForm 
                initialData={editingProperty}
                onCancel={() => setEditingProperty(null)} 
                onPropertyAdded={(p) => {
                  setEditingProperty(null);
                  loadMyProperties();
                }}
              />
            )}

            {!showAddForm && !editingProperty && (
              <>
                {loadingMyProperties ? (
                  <div style={{ padding: '40px', textAlign: 'center' }} className="spinner"></div>
                ) : myProperties.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🏘️</span>
                    <h3>You haven't listed any property yet</h3>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>List your property today and connect directly with tenants looking for spaces!</p>
                    <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                      List Your Property Now
                    </button>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th>Property Title</th>
                          <th>Location</th>
                          <th>Property Type</th>
                          <th>Rent / Month</th>
                          <th>Status</th>
                          <th>Verified</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myProperties.map(p => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: '600' }}>
                              <Link to={`/property/${p.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                {p.title}
                              </Link>
                            </td>
                            <td>{p.locality ? `${p.locality}, ` : ''}{p.city}</td>
                            <td style={{ textTransform: 'capitalize' }}>{p.property_type?.replace('-', ' ')}</td>
                            <td style={{ fontWeight: '600' }}>₹{Number(p.monthly_rent).toLocaleString()}</td>
                            <td>
                              <span className={`status-badge status-${p.is_active ? 'confirmed' : 'cancelled'}`}>
                                {p.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td style={{ fontWeight: 'bold', color: p.is_verified ? '#059669' : '#64748b' }}>
                              {p.is_verified ? '✓ Yes' : 'Pending'}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => setEditingProperty(p)}
                                  style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                                >
                                  ✏️ Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteProperty(p.id)}
                                  style={{ padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="dashboard-section-card">
            <h2>My Wishlist</h2>
            {loadingWishlist ? (
              <div style={{ padding: '40px', textAlign: 'center' }} className="spinner"></div>
            ) : wishlistItems.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>❤️</span>
                <h3>Your wishlist is empty</h3>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>Keep track of properties you love by saving them</p>
                <button className="btn btn-primary" onClick={() => navigate('/properties')}>
                  Browse Properties
                </button>
              </div>
            ) : (
              <div className="properties-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {wishlistItems.map(item => {
                  const propertyData = item.property || item;
                  return (
                    <div key={item.id} style={{ position: 'relative' }}>
                      <PropertyCard 
                        property={propertyData} 
                        onPropertyClick={(pid) => navigate(`/property/${pid}`)}
                      />
                      <button
                        onClick={() => handleRemoveWishlist(propertyData.id || item.property_id)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(239, 68, 68, 0.95)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          zIndex: 10,
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Profile Info Form */}
            <div className="dashboard-section-card">
              <h2>Edit Profile</h2>
              {profileMessage.text && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  backgroundColor: profileMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
                  color: profileMessage.type === 'success' ? '#065f46' : '#991b1b',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {profileMessage.type === 'success' ? '✅' : '⚠️'} {profileMessage.text}
                </div>
              )}
              
              <form onSubmit={handleProfileSubmit}>
                <div className="profile-form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      value={profileForm.name} 
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      value={profileForm.phone} 
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} 
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label>Profile Image URL</label>
                    <input 
                      type="text" 
                      value={profileForm.profile_image} 
                      onChange={(e) => setProfileForm({ ...profileForm, profile_image: e.target.value })} 
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
                
                <div className="profile-submit-row">
                  <button type="submit" className="btn btn-primary" disabled={submittingProfile}>
                    {submittingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="dashboard-section-card">
              <h2>Change Password</h2>
              {passwordMessage.text && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  backgroundColor: passwordMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
                  color: passwordMessage.type === 'success' ? '#065f46' : '#991b1b',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {passwordMessage.type === 'success' ? '✅' : '⚠️'} {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="profile-form-grid">
                  <div className="form-group">
                    <label>Current Password *</label>
                    <input 
                      type="password" 
                      value={passwordForm.currentPassword} 
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    {/* Empty cell for layout matching */}
                  </div>
                  <div className="form-group">
                    <label>New Password *</label>
                    <input 
                      type="password" 
                      value={passwordForm.newPassword} 
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password *</label>
                    <input 
                      type="password" 
                      value={passwordForm.confirmPassword} 
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                <div className="profile-submit-row">
                  <button type="submit" className="btn btn-primary" disabled={submittingPassword}>
                    {submittingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;