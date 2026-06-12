import React, { useState, useEffect } from 'react';
import { propertyService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/authService';
import './AddPropertyForm.css';

const AddPropertyForm = ({ initialData, onPropertyAdded, onCancel }) => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    property_type: initialData?.property_type || 'apartment',
    category_id: initialData?.category_id || '',
    city_id: initialData?.city_id || '',
    monthly_rent: initialData?.monthly_rent || '',
    security_deposit: initialData?.security_deposit || '',
    maintenance: initialData?.maintenance || '',
    bedrooms: initialData?.bedrooms || 1,
    bathrooms: initialData?.bathrooms || 1,
    area_sqft: initialData?.area_sqft || '',
    furnishing: initialData?.furnishing || 'semi-furnished',
    parking: initialData?.parking || 'none',
    pet_friendly: initialData?.pet_friendly !== undefined ? initialData.pet_friendly : false,
    address_line1: initialData?.address_line1 || '',
    address_line2: initialData?.address_line2 || '',
    city: initialData?.city || '',
    locality: initialData?.locality || '',
    state: initialData?.state || '',
    pincode: initialData?.pincode || '',
    latitude: initialData?.latitude || 28.6139,
    longitude: initialData?.longitude || 77.2090,
    nearby_metro: initialData?.nearby_metro || '',
    owner_name: initialData?.owner_name || user?.name || '',
    owner_phone: initialData?.owner_phone || user?.phone || '',
    owner_email: initialData?.owner_email || user?.email || '',
    images: Array.isArray(initialData?.images) ? initialData.images.join(', ') : (initialData?.images || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'),
  });

  const [selectedAmenities, setSelectedAmenities] = useState({
    Wifi: true,
    'Air Conditioning': true,
    Lift: false,
    Gym: false,
    Clubhouse: false,
    Security: true,
    'Water Supply 24x7': true,
    'Power Backup': false,
    'Two Wheeler Parking': false,
    'Car Parking': false,
  });

  useEffect(() => {
    // Fetch categories and cities
    const fetchMetadata = async () => {
      try {
        const [citiesRes, catsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/cities`).then(r => r.json()),
          fetch(`${API_BASE_URL}/categories`).then(r => r.json())
        ]);
        if (citiesRes.success) setCities(citiesRes.data);
        if (catsRes.success) setCategories(catsRes.data);
      } catch (err) {
        console.error('Error fetching form metadata:', err);
      }
    };
    fetchMetadata();

    // Map initial amenities if editing
    if (initialData?.amenities && Array.isArray(initialData.amenities)) {
      const mapped = { ...selectedAmenities };
      initialData.amenities.forEach(item => {
        mapped[item] = true;
      });
      setSelectedAmenities(mapped);
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    const selected = cities.find(c => Number(c.id) === Number(cityId));
    if (selected) {
      setFormData(prev => ({
        ...prev,
        city_id: cityId,
        city: selected.name,
        state: selected.state
      }));
    } else {
      setFormData(prev => ({ ...prev, city_id: '', city: '', state: '' }));
    }
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const selected = categories.find(c => Number(c.id) === Number(catId));
    if (selected) {
      setFormData(prev => ({
        ...prev,
        category_id: catId,
        property_type: selected.slug
      }));
    } else {
      setFormData(prev => ({ ...prev, category_id: '' }));
    }
  };

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities(prev => ({
      ...prev,
      [amenity]: !prev[amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const amenitiesArray = Object.keys(selectedAmenities).filter(key => selectedAmenities[key]);
    const imagesArray = formData.images
      .split(',')
      .map(url => url.trim())
      .filter(Boolean);

    const propertyData = {
      ...formData,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      city_id: formData.city_id ? parseInt(formData.city_id) : null,
      monthly_rent: parseFloat(formData.monthly_rent),
      security_deposit: parseFloat(formData.security_deposit) || 0,
      maintenance: parseFloat(formData.maintenance) || 0,
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseFloat(formData.bathrooms),
      area_sqft: parseInt(formData.area_sqft) || null,
      latitude: parseFloat(formData.latitude) || 28.6139,
      longitude: parseFloat(formData.longitude) || 77.2090,
      amenities: amenitiesArray,
      images: imagesArray,
    };

    try {
      let res;
      if (initialData?.id) {
        res = await propertyService.updateProperty(initialData.id, propertyData, token);
      } else {
        res = await propertyService.createProperty(propertyData, token);
      }

      if (res.success) {
        setSuccess(initialData?.id ? 'Listing updated successfully!' : 'Congratulations! Listing added successfully.');
        setTimeout(() => {
          if (onPropertyAdded) {
            onPropertyAdded(res.property);
          }
        }, 1500);
      } else {
        setError(res.error || 'Failed to submit form.');
      }
    } catch (err) {
      setError('An error occurred during submission.');
    }
    setLoading(false);
  };

  return (
    <div className="add-prop-card glass-morph">
      <div className="add-prop-header">
        <h2>{initialData?.id ? 'Edit Property Listing' : 'List Your Rental Property'}</h2>
        <p>List your flat, villa, independent house or PG. Reach thousands of verified tenants with zero brokerages.</p>
      </div>

      {error && <div className="prop-alert error-alert">⚠️ {error}</div>}
      {success && <div className="prop-alert success-alert">✅ {success}</div>}

      <form onSubmit={handleSubmit} className="add-prop-form">
        
        {/* Section 1: Basic Details */}
        <div className="form-section">
          <h3 className="section-subtitle">🏡 Basic Details</h3>
          <div className="inputs-grid">
            <div className="form-item col-full">
              <label htmlFor="title">Property Title *</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                placeholder="e.g. Premium 2 BHK Flat with Modular Kitchen in Dwarka" 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item col-full">
              <label htmlFor="description">Detailed Description *</label>
              <textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Describe modular features, wardrobes, security, water supply timing..." 
                rows="4" 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="category_id">Category *</label>
              <select 
                id="category_id" 
                name="category_id" 
                value={formData.category_id} 
                onChange={handleCategoryChange}
                required
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-item">
              <label htmlFor="area_sqft">Super Area (Sqft) *</label>
              <input 
                type="number" 
                id="area_sqft" 
                name="area_sqft" 
                value={formData.area_sqft} 
                onChange={handleInputChange} 
                placeholder="e.g. 1200"
                required 
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Specs */}
        <div className="form-section">
          <h3 className="section-subtitle">🛏️ Rooms, Furnishing and Parking</h3>
          <div className="inputs-grid">
            <div className="form-item">
              <label htmlFor="bedrooms">Bedrooms *</label>
              <input 
                type="number" 
                id="bedrooms" 
                name="bedrooms" 
                value={formData.bedrooms} 
                onChange={handleInputChange} 
                min="0" 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="bathrooms">Bathrooms *</label>
              <input 
                type="number" 
                id="bathrooms" 
                name="bathrooms" 
                value={formData.bathrooms} 
                onChange={handleInputChange} 
                step="1" 
                min="1" 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="furnishing">Furnishing Status *</label>
              <select 
                id="furnishing" 
                name="furnishing" 
                value={formData.furnishing} 
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="fully-furnished">Fully Furnished</option>
                <option value="semi-furnished">Semi Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>

            <div className="form-item">
              <label htmlFor="parking">Parking *</label>
              <select 
                id="parking" 
                name="parking" 
                value={formData.parking} 
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="none">No Parking</option>
                <option value="two-wheeler">Two Wheeler only</option>
                <option value="four-wheeler">Four Wheeler only</option>
                <option value="both">Both 2 & 4 Wheeler</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Location */}
        <div className="form-section">
          <h3 className="section-subtitle">📍 Location Details</h3>
          <div className="inputs-grid">
            <div className="form-item">
              <label htmlFor="city_id">City *</label>
              <select 
                id="city_id" 
                name="city_id" 
                value={formData.city_id} 
                onChange={handleCityChange}
                required
                disabled={loading}
              >
                <option value="">Select City</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-item">
              <label htmlFor="locality">Locality / Sector *</label>
              <input 
                type="text" 
                id="locality" 
                name="locality" 
                value={formData.locality} 
                onChange={handleInputChange} 
                placeholder="e.g. Dwarka Sector 10" 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item col-full">
              <label htmlFor="address_line1">Address Line 1 *</label>
              <input 
                type="text" 
                id="address_line1" 
                name="address_line1" 
                value={formData.address_line1} 
                onChange={handleInputChange} 
                placeholder="Flat no, building name..." 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="pincode">Pincode *</label>
              <input 
                type="text" 
                id="pincode" 
                name="pincode" 
                value={formData.pincode} 
                onChange={handleInputChange} 
                placeholder="110075" 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="nearby_metro">Nearby Metro Station</label>
              <input 
                type="text" 
                id="nearby_metro" 
                name="nearby_metro" 
                value={formData.nearby_metro} 
                onChange={handleInputChange} 
                placeholder="e.g. Dwarka Sector 10 Metro (~500m)" 
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Rental Pricing */}
        <div className="form-section">
          <h3 className="section-subtitle">💰 Rental Pricing</h3>
          <div className="inputs-grid">
            <div className="form-item">
              <label htmlFor="monthly_rent">Monthly Rent (₹) *</label>
              <input 
                type="number" 
                id="monthly_rent" 
                name="monthly_rent" 
                value={formData.monthly_rent} 
                onChange={handleInputChange} 
                placeholder="e.g. 18000"
                min="1" 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="security_deposit">Security Deposit (₹)</label>
              <input 
                type="number" 
                id="security_deposit" 
                name="security_deposit" 
                value={formData.security_deposit} 
                onChange={handleInputChange} 
                placeholder="e.g. 36000"
                min="0" 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="maintenance">Maintenance Charges (₹/month)</label>
              <input 
                type="number" 
                id="maintenance" 
                name="maintenance" 
                value={formData.maintenance} 
                onChange={handleInputChange} 
                placeholder="e.g. 2000"
                min="0" 
                disabled={loading}
              />
            </div>

            <div className="form-item" style={{ display: 'flex', alignItems: 'center', marginTop: '30px' }}>
              <label className="amenity-checkbox-label">
                <input 
                  type="checkbox" 
                  name="pet_friendly"
                  checked={formData.pet_friendly} 
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span style={{ marginLeft: '8px' }}>Pet Friendly Listing</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 5: Media URLs */}
        <div className="form-section">
          <h3 className="section-subtitle">📸 Photos</h3>
          <div className="form-item col-full">
            <label htmlFor="images">Image URLs (Comma-separated for multiple)</label>
            <input 
              type="text" 
              id="images" 
              name="images" 
              value={formData.images} 
              onChange={handleInputChange} 
              placeholder="e.g. https://domain.com/photo1.jpg, https://domain.com/photo2.jpg" 
              required 
              disabled={loading}
            />
            <span className="input-hint">Provide one or more high-quality image URLs representing your listing.</span>
          </div>
        </div>

        {/* Section 6: Amenities */}
        <div className="form-section">
          <h3 className="section-subtitle">⭐ Society & Flat Amenities</h3>
          <div className="amenities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
            {Object.keys(selectedAmenities).map(amenity => (
              <label key={amenity} className="amenity-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={selectedAmenities[amenity]} 
                  onChange={() => handleAmenityChange(amenity)}
                  disabled={loading}
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 7: Landlord Info */}
        <div className="form-section">
          <h3 className="section-subtitle">👤 Owner Information</h3>
          <div className="inputs-grid">
            <div className="form-item">
              <label htmlFor="owner_name">Owner Name *</label>
              <input 
                type="text" 
                id="owner_name" 
                name="owner_name" 
                value={formData.owner_name} 
                onChange={handleInputChange} 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-item">
              <label htmlFor="owner_phone">Owner Phone *</label>
              <input 
                type="tel" 
                id="owner_phone" 
                name="owner_phone" 
                value={formData.owner_phone} 
                onChange={handleInputChange} 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-item">
              <label htmlFor="owner_email">Owner Email *</label>
              <input 
                type="email" 
                id="owner_email" 
                name="owner_email" 
                value={formData.owner_email} 
                onChange={handleInputChange} 
                required 
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-buttons" style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold' }}
          >
            {loading ? 'Submitting...' : initialData?.id ? 'Update Listing' : 'Publish Property Listing'}
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
            disabled={loading}
            style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold' }}
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddPropertyForm;
