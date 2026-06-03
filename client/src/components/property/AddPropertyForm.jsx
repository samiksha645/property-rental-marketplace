import React, { useState } from 'react';
import { propertyService } from '../../services/api';
import './AddPropertyForm.css';

const AddPropertyForm = ({ onPropertyAdded, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    square_feet: 600,
    max_guests: 2,
    base_price_per_night: 120,
    cleaning_fee: 40,
    security_deposit: 150,
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
    cancellation_policy: 'flexible',
    images: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
  });

  const [selectedAmenities, setSelectedAmenities] = useState({
    Wifi: true,
    'Air Conditioning': true,
    Kitchen: true,
    Pool: false,
    'Hot Tub': false,
    Beachfront: false,
    'Free Parking': false,
    Gym: false,
    'Washing Machine': false,
    Dryer: false,
  });

  const amenitiesList = [
    'Wifi',
    'Air Conditioning',
    'Kitchen',
    'Pool',
    'Hot Tub',
    'Beachfront',
    'Free Parking',
    'Gym',
    'Washing Machine',
    'Dryer'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    // Construct array of selected amenities
    const amenitiesArray = Object.keys(selectedAmenities).filter(
      key => selectedAmenities[key]
    );

    // Split image URLs by comma
    const imagesArray = formData.images
      .split(',')
      .map(url => url.trim())
      .filter(Boolean);

    const propertyData = {
      ...formData,
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseFloat(formData.bathrooms),
      square_feet: parseInt(formData.square_feet),
      max_guests: parseInt(formData.max_guests),
      base_price_per_night: parseFloat(formData.base_price_per_night),
      cleaning_fee: parseFloat(formData.cleaning_fee) || 0,
      security_deposit: parseFloat(formData.security_deposit) || 0,
      amenities: amenitiesArray,
      images: imagesArray,
    };

    const res = await propertyService.createProperty(propertyData);

    if (res.success) {
      setSuccess('Congratulations! Your property has been listed successfully.');
      setTimeout(() => {
        if (onPropertyAdded) {
          onPropertyAdded(res.property);
        }
      }, 2000);
    } else {
      setError(res.error || 'Failed to list property. Please check inputs and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="add-prop-card glass-morph">
      <div className="add-prop-header">
        <h2>List Your Property</h2>
        <p>Fill out the details below to publish your rental listing for potential guests worldwide.</p>
      </div>

      {error && <div className="prop-alert error-alert">⚠️ {error}</div>}
      {success && <div className="prop-alert success-alert">✅ {success}</div>}

      <form onSubmit={handleSubmit} className="add-prop-form">
        
        {/* Section 1: Basic Details */}
        <div className="form-section">
          <h3 className="section-subtitle">🏡 Basic Details</h3>
          <div className="inputs-grid">
            <div className="form-item col-full">
              <label htmlFor="title">Property Title</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                placeholder="e.g. Modern Suite with Breathtaking Lake Views" 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item col-full">
              <label htmlFor="description">Detailed Description</label>
              <textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Describe your space, amenities, local neighborhood, and access instructions..." 
                rows="4" 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="property_type">Property Type</label>
              <select 
                id="property_type" 
                name="property_type" 
                value={formData.property_type} 
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="studio">Studio</option>
                <option value="townhouse">Townhouse</option>
              </select>
            </div>

            <div className="form-item">
              <label htmlFor="square_feet">Square Feet</label>
              <input 
                type="number" 
                id="square_feet" 
                name="square_feet" 
                value={formData.square_feet} 
                onChange={handleInputChange} 
                min="10" 
                required 
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Rooms and Capacity */}
        <div className="form-section">
          <h3 className="section-subtitle">🛏️ Rooms and Capacity</h3>
          <div className="inputs-grid">
            <div className="form-item">
              <label htmlFor="bedrooms">Bedrooms</label>
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
              <label htmlFor="bathrooms">Bathrooms</label>
              <input 
                type="number" 
                id="bathrooms" 
                name="bathrooms" 
                value={formData.bathrooms} 
                onChange={handleInputChange} 
                step="0.5" 
                min="0" 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="max_guests">Max Guests Allowed</label>
              <input 
                type="number" 
                id="max_guests" 
                name="max_guests" 
                value={formData.max_guests} 
                onChange={handleInputChange} 
                min="1" 
                required 
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Location */}
        <div className="form-section">
          <h3 className="section-subtitle">📍 Location Details</h3>
          <div className="inputs-grid">
            <div className="form-item col-full">
              <label htmlFor="address_line1">Address Line 1</label>
              <input 
                type="text" 
                id="address_line1" 
                name="address_line1" 
                value={formData.address_line1} 
                onChange={handleInputChange} 
                placeholder="e.g. 100 Sunset Blvd" 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item col-full">
              <label htmlFor="address_line2">Address Line 2 (Optional)</label>
              <input 
                type="text" 
                id="address_line2" 
                name="address_line2" 
                value={formData.address_line2} 
                onChange={handleInputChange} 
                placeholder="e.g. Apt 4B or Suite 200" 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="city">City</label>
              <input 
                type="text" 
                id="city" 
                name="city" 
                value={formData.city} 
                onChange={handleInputChange} 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="state">State</label>
              <input 
                type="text" 
                id="state" 
                name="state" 
                value={formData.state} 
                onChange={handleInputChange} 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="postal_code">Postal Code</label>
              <input 
                type="text" 
                id="postal_code" 
                name="postal_code" 
                value={formData.postal_code} 
                onChange={handleInputChange} 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="country">Country</label>
              <input 
                type="text" 
                id="country" 
                name="country" 
                value={formData.country} 
                onChange={handleInputChange} 
                required 
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Pricing and Policies */}
        <div className="form-section">
          <h3 className="section-subtitle">💰 Pricing and Policies</h3>
          <div className="inputs-grid">
            <div className="form-item">
              <label htmlFor="base_price_per_night">Price / Night ($)</label>
              <input 
                type="number" 
                id="base_price_per_night" 
                name="base_price_per_night" 
                value={formData.base_price_per_night} 
                onChange={handleInputChange} 
                min="1" 
                required 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="cleaning_fee">Cleaning Fee ($)</label>
              <input 
                type="number" 
                id="cleaning_fee" 
                name="cleaning_fee" 
                value={formData.cleaning_fee} 
                onChange={handleInputChange} 
                min="0" 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="security_deposit">Security Deposit ($)</label>
              <input 
                type="number" 
                id="security_deposit" 
                name="security_deposit" 
                value={formData.security_deposit} 
                onChange={handleInputChange} 
                min="0" 
                disabled={loading}
              />
            </div>

            <div className="form-item">
              <label htmlFor="cancellation_policy">Cancellation Policy</label>
              <select 
                id="cancellation_policy" 
                name="cancellation_policy" 
                value={formData.cancellation_policy} 
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="flexible">Flexible (100% refund up to 24h before)</option>
                <option value="moderate">Moderate (100% refund up to 5 days before)</option>
                <option value="strict">Strict (50% refund up to 7 days before)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 5: Amenities */}
        <div className="form-section">
          <h3 className="section-subtitle">⭐ Amenities</h3>
          <p className="section-desc">Select all amenities available at your property:</p>
          <div className="amenities-grid">
            {amenitiesList.map(amenity => (
              <label key={amenity} className="amenity-checkbox-label">
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

        {/* Section 6: Media */}
        <div className="form-section">
          <h3 className="section-subtitle">📸 Media and Photos</h3>
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

        {/* Form Actions */}
        <div className="form-buttons">
          <button 
            type="submit" 
            className="btn-submit-listing" 
            disabled={loading}
          >
            {loading ? 'Publishing Listing...' : 'Publish Property Listing'}
          </button>
          
          <button 
            type="button" 
            className="btn-cancel-listing" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddPropertyForm;
