import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Booking.css'; // Uses the same master CSS file

const BookingSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="booking-container success-view">
      <div className="booking-card success-card">
        
        {/* Animated Check Icon */}
        <div className="check-icon">
          ✓
        </div>

        {/* Success Message */}
        <h1>BOOKING SUCCESSFUL!</h1>
        
        <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>
          Your tickets have been confirmed.
        </p>

        {/* Reference Number (Fake for now, or real if you pass it) */}
        <div className="ref-text">
          Booking Ref: <span>#{Math.floor(Math.random() * 1000000)}</span>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <button 
                className="confirm-btn" 
                style={{ minWidth: '200px' }}
                onClick={() => navigate('/')}
            >
                BACK TO HOME
            </button>
            
            <button 
                className="history-btn" 
                onClick={() => navigate('/my-bookings')}
            >
                VIEW MY BOOKINGS
            </button>
        </div>

      </div>
    </div>
  );
};

export default BookingSuccess;