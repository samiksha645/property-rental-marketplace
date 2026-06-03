import React from 'react';
import PropertyCard from './PropertyCard.jsx';

const PropertyGrid = ({ properties, onPropertyClick, onBook, loading, error }) => {
  // 1. Handle Loading State
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', fontSize: '18px', color: '#4b5563', fontWeight: '500' }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #6366f1',
          borderRadius: '50%',
          margin: '0 auto 16px auto',
          animation: 'spin 1s linear infinite'
        }}></div>
        Loading amazing properties...
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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
        borderRadius: '12px',
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
        background: '#f9fafb',
        borderRadius: '12px',
        border: '1px dashed #e5e7eb'
      }}>
        🏠 No properties match your criteria. Try resetting filters!
      </div>
    );
  }

  // 4. Render Grid layout
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '30px',
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