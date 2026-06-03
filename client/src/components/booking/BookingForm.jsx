import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/api';

const BookingForm = ({ property, onBookingSuccess, onBookingError }) => {
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check availability when dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (checkInDate && checkOutDate && property?.id) {
        const result = await bookingService.checkAvailability(
          property.id,
          checkInDate,
          checkOutDate
        );
        setAvailability(result);
        
        if (!result.success) {
          setError(result.error || 'Unable to check availability');
        } else if (!result.available) {
          setError('Selected dates are not available');
        } else {
          setError('');
        }
      }
    };

    const debounceTimer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [checkInDate, checkOutDate, property]);

  const getMinCheckInDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinCheckOutDate = () => {
    if (checkInDate) {
      const nextDay = new Date(checkInDate);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay.toISOString().split('T')[0];
    }
    return getMinCheckInDate();
  };

  const calculateTotalPrice = () => {
    if (!availability?.pricing) return null;
    
    const { pricing } = availability;
    return {
      nights: pricing.nights,
      subtotal: pricing.subtotal,
      cleaningFee: pricing.cleaning_fee_charged,
      serviceFee: pricing.service_fee,
      total: pricing.total_amount,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!checkInDate || !checkOutDate) {
      setError('Please select check-in and check-out dates');
      return;
    }

    if (!availability?.available) {
      setError('Selected dates are not available');
      return;
    }

    if (guestCount > property.max_guests) {
      setError(`Maximum ${property.max_guests} guests allowed`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const bookingData = {
      property_id: property.id,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      guest_count: guestCount,
      special_requests: specialRequests || null,
    };

    // In production, get auth token from context/localStorage
    const authToken = localStorage.getItem('auth_token');
    
    const result = await bookingService.createBooking(bookingData, authToken);

    if (result.success) {
      setSuccess('Booking created successfully! Redirecting to payment...');
      if (onBookingSuccess) {
        onBookingSuccess(result.booking, result.pricing);
      }
      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess('');
        setCheckInDate('');
        setCheckOutDate('');
        setGuestCount(1);
        setSpecialRequests('');
      }, 2000);
    } else {
      setError(result.error || 'Failed to create booking');
      if (onBookingError) {
        onBookingError(result.error);
      }
    }
    
    setLoading(false);
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="booking-form-container">
      <h3>Book this property</h3>
      
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="checkIn">Check-in Date</label>
          <input
            type="date"
            id="checkIn"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            min={getMinCheckInDate()}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="checkOut">Check-out Date</label>
          <input
            type="date"
            id="checkOut"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            min={getMinCheckOutDate()}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="guests">Number of Guests</label>
          <select
            id="guests"
            value={guestCount}
            onChange={(e) => setGuestCount(parseInt(e.target.value))}
            disabled={loading}
          >
            {[...Array(property.max_guests)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} Guest{i !== 0 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="requests">Special Requests (Optional)</label>
          <textarea
            id="requests"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows="3"
            placeholder="Any special requests or requirements?"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}

        {totalPrice && availability?.available && (
          <div className="price-breakdown">
            <h4>Price Breakdown</h4>
            <div className="price-row">
              <span>${property.base_price_per_night} x {totalPrice.nights} nights</span>
              <span>${totalPrice.subtotal}</span>
            </div>
            <div className="price-row">
              <span>Cleaning fee</span>
              <span>${totalPrice.cleaningFee}</span>
            </div>
            <div className="price-row">
              <span>Service fee (10%)</span>
              <span>${totalPrice.serviceFee}</span>
            </div>
            <div className="price-row total">
              <strong>Total</strong>
              <strong>${totalPrice.total}</strong>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="book-button"
          disabled={loading || !availability?.available || !checkInDate || !checkOutDate}
        >
          {loading ? 'Processing...' : 'Request to Book'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;