import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Booking.css';

const MyBookingsPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await axios.get('http://localhost:5001/api/bookings/user/user_123');
      setHistory(res.data);
    };
    fetchHistory();
  }, []);

  const handleCancel = async (id) => {
    if(!window.confirm("Cancel this booking?")) return;
    await axios.put(`http://localhost:5001/api/bookings/cancel/${id}`);
    window.location.reload();
  };

  return (
  <div className="history-page-container">
  <div className="history-page-wrapper">
    
    {/* Left Side: The Centered Title Box */}
    <div className="history-title-box">
      <h1 className="history-title">MY<br/>BOOKINGS</h1>
    </div>

    {/* Right Side: The Horizontal Grid of Cards */}
    <div className="history-list">
      {history.map(b => (
        <div key={b._id} className="history-item">
          <div className="item-info">
            <h3>TICKET REF: {b.bookingReference}</h3>
            <p>Movie: <span>{b.movieTitle || "Mufasa: The Lion King"}</span></p>
            <p>Seats: <span>{b.seatIds.join(", ")}</span></p>
            <p>Date: <span>18th Dec 2025</span></p>
            <p>Time:  <span>07:30 PM</span></p>
            <p>Status:<span className={b.status.toLowerCase()}>{b.status}</span></p>
          </div>
          
          {b.status !== 'Cancelled' && (
            <button className="cancel-btn-outline" onClick={() => handleCancel(b._id)}>
              CANCEL BOOKING
            </button>
          )}
        </div>
      ))}
    </div>

  </div>
  </div>
);
};

export default MyBookingsPage;