import React from 'react';
import PropertyCard from './PropertyCard.jsx';

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-line skeleton-line-sm"></div>
      <div className="skeleton-line skeleton-line-lg"></div>
      <div className="skeleton-line skeleton-line-full"></div>
      <div className="skeleton-footer">
        <div className="skeleton-price"></div>
        <div className="skeleton-buttons">
          <div className="skeleton-btn"></div>
          <div className="skeleton-btn"></div>
        </div>
      </div>
    </div>
  </div>
);

const PropertyGrid = ({ properties, onPropertyClick, onBook, loading, error }) => {
  // 1. Handle Loading State
  if (loading) {
    return (
      <div className="properties-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', padding: '20px 0' }}>
        {[1, 2, 3, 4, 5, 6].map(n => (
          <SkeletonCard key={n} />
        ))}
      </div>
    );
  }

  // 2. Handle Error State
  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#ef4444',
        fontSize: '16px',
        background: '#fef2f2',
        borderRadius: '16px',
        border: '1px solid #fee2e2',
        margin: '20px 0'
      }}>
        ❌ {error || 'Failed to load properties. Is the backend server running?'}
      </div>
    );
  }

  // 3. Handle Empty State
  if (!properties || properties.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#6b7280',
        fontSize: '16px',
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #f0f0f8'
      }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🏘️</span>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#111118', marginBottom: '8px' }}>No properties match your criteria</h3>
        <p style={{ color: '#8a8a9e', marginBottom: '24px' }}>Try resetting filters or searching for a different keyword</p>
      </div>
    );
  }

  // 4. Render Grid layout
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px',
      padding: '20px 0'
    }}>
      {properties.map((property) => (
        <PropertyCard 
          key={property.id || Math.random()} 
          property={property} 
          onPropertyClick={onPropertyClick || onBook} 
        />
      ))}
    </div>
  );
};

export default PropertyGrid;