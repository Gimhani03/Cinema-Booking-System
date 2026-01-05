import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Booking.css';

const CreateBookingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [bookingDetails] = useState({
    movieTitle: "Mufasa: The Lion King",
    showtimeId: "mock_123",
    seats: ["C1", "C2"], 
    totalPrice: 2000
  });

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/bookings', {
        userId: "user_123",
        showtimeId: bookingDetails.showtimeId,
        seatIds: bookingDetails.seats,
        totalPrice: bookingDetails.totalPrice
      });
      // Move to Success Page and pass the booking data
      navigate('/booking-success', { state: { booking: response.data.booking } });
    } catch (err) {
      alert("Booking failed: " + (err.response?.data?.message || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="booking-container">
    <div className="booking-card">
      <h1>Confirm Booking</h1>
      
      <div className="summary-details">
        <div className="detail-row">
          <span className="label">Movie Name</span>
          <span className="value">{bookingDetails.movieTitle}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Selected Seats</span>
          <span className="value">{bookingDetails.seats.join(", ")}</span>
        </div>
      </div>

      <div className="price-section">
        <span className="price-label">Total Amount</span>
        <span className="price-amount">Rs. {bookingDetails.totalPrice}</span>
      </div>

      <div className="confirm-btn-container">
        <button className="confirm-btn" onClick={handleConfirm} disabled={loading}>
          {loading ? "WAITING..." : "CONFIRM & PAY NOW"}
        </button>
      </div>
    </div>
  </div>
);
};

export default CreateBookingPage;