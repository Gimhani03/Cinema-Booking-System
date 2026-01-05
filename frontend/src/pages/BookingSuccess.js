import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Booking.css';

const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const booking = state?.booking;

  return (
  <div className="booking-container success-view">
    <div className="booking-card success-card">
      {/* Dynamic Animated Icon */}
      <div className="check-icon">✓</div>
      
      <h1>BOOKING SUCCESSFUL!</h1>
      
      <p className="ref-text">
        Reference: <span>{booking?.bookingReference || "3DWPKXOE"}</span>
      </p>

      <button className="history-btn" onClick={() => navigate('/my-bookings')}>
        VIEW MY HISTORY
      </button>
    </div>
  </div>
);
};

export default BookingSuccess;