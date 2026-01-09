import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './Booking.css';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded User ID for testing
  const userId = "user_123";

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/bookings/user/${userId}`);
        
        // Handle array vs object response
        const data = Array.isArray(res.data) ? res.data : res.data.bookings || [];
        
        // Sort: Newest bookings first
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setHistory(sortedData);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleCancel = async (id) => {
    if(!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
        await axios.delete(`http://localhost:5001/api/bookings/${id}`);
        setHistory(history.filter(b => b._id !== id));
        alert("Booking cancelled successfully.");
    } catch (err) {
        console.error("Cancel failed:", err);
        alert("Could not cancel booking.");
    }
  };

  // Helper to safely display seats
  const renderSeats = (seats) => {
    if (!seats || seats.length === 0) return "None";
    
    // If seats are objects (Populated)
    if (typeof seats[0] === 'object') {
        // Try to find the seat number property (adjust 'seatNumber' if your DB uses 'number' or 'label')
        return seats.map(s => s.seatNumber || s.number || `${s.row}${s.number}`).join(", ");
    }
    
    // If seats are just strings (IDs) - Fallback
    return seats.join(", ");
  };

  if (loading) return <div className="history-page-container"><h2 style={{color:'white'}}>Loading History...</h2></div>;

  return (
    <div className="history-page-container">
      <button 
        onClick={() => navigate('/')} 
        style={{
          position: 'absolute',
          left: '20px',
          top: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          zIndex: 10
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255, 61, 0, 0.2)';
          e.currentTarget.style.borderColor = '#ff3d00';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <FaArrowLeft />
      </button>
      <div className="history-page-wrapper">
        
        {/* Left Side: Title Box */}
        <div className="history-title-box">
          <h1 className="history-title">MY<br/>BOOKING<br/>HISTORY</h1>
          <p style={{color: '#94a3b8', marginTop: '15px'}}>
            You have {history.length} active bookings.
          </p>
          
          <button 
            className="confirm-btn" 
            style={{marginTop: '30px', minWidth: '100%', fontSize: '0.9rem'}} 
            onClick={() => navigate('/')}
          >
            BOOK NEW MOVIE
          </button>
          
          <button 
              className="history-btn" 
              style={{marginTop: '15px', minWidth: '100%', fontSize: '0.9rem', border: '1px solid #ff3333', color: '#ff3333'}} 
              onClick={async () => {
                  if(window.confirm("Delete ALL history? This cannot be undone.")) {
                      try {
                          await axios.post('http://localhost:5001/api/bookings/clear-history', { 
                              userId: 'user_123' 
                          });
                          window.location.reload(); 
                      } catch (err) {
                          if (err.response) {
                              alert(`FAILED: ${err.response.status} - ${err.response.statusText}\n${JSON.stringify(err.response.data)}`);
                          } else {
                              alert(`Network Error: Is the backend running? \n${err.message}`);
                          }
                      }
                  }
              }}
            >
          CLEAR HISTORY
        </button>
            
        </div>

        {/* Right Side: Grid of Cards */}
        <div className="history-list">
          {history.length === 0 ? (
             <h3 style={{color:'white'}}>No bookings found.</h3>
          ) : (
             history.map(b => (
                <div key={b._id} className="history-item">
                  <div className="item-info">
                    <h3>REF: #{b._id.slice(-6).toUpperCase()}</h3>
                    
                    {/* 👇 UPDATED: Uses 'showtimeId' instead of 'showtime' */}
                    <p>
                        <span style={{color:'#94a3b8'}}>Movie:</span> 
                        <span>{b.showtimeId?.movie?.title || "Movie Name Loading..."}</span>
                    </p>

                    {/* 👇 UPDATED: Uses 'seatIds' instead of 'seats' */}
                    <p>
                        <span style={{color:'#94a3b8'}}>Seats:</span> 
                        <span>{renderSeats(b.seatIds)}</span>
                    </p>

                    {/* 👇 UPDATED: Uses 'showtimeId' for Date */}
                    <p>
                        <span style={{color:'#94a3b8'}}>Date:</span> 
                        <span>{b.showtimeId ? new Date(b.showtimeId.date).toLocaleDateString() : "Date N/A"}</span>
                    </p>
                    
                    {/* 👇 UPDATED: Uses 'showtimeId' for Time */}
                    <p>
                        <span style={{color:'#94a3b8'}}>Time:</span> 
                        <span>{b.showtimeId ? b.showtimeId.startTime : "Time N/A"}</span>
                    </p>

                    <p>
                        <span style={{color:'#94a3b8'}}>Paid:</span> 
                        <span style={{color: '#00ff88'}}>Rs. {b.totalPrice}</span>
                    </p>
                  </div>
                  
                  <button className="cancel-btn-outline" onClick={() => handleCancel(b._id)}>
                      CANCEL TICKET
                  </button>
                </div>
             ))
          )}
        </div>

      </div>
    </div>
  );
};

export default MyBookingsPage;