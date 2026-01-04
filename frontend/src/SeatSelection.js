import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SeatMap.css';

const SeatSelection = () => {
  const [seats, setSeats] = useState([]);
  const showtimeId = "IMAX_PREMIERE_200"; // New ID for the 200-seat hall

  // 1. Fetch Seats
  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/seats/${showtimeId}`);
      setSeats(res.data);
    } catch (err) {
      console.error("Error connecting to backend:", err);
    }
  };

  // 2. Handle Clicks
  const handleSeatClick = async (seat) => {
    if (seat.status === 'BOOKED') return;

    const newStatus = seat.status === 'AVAILABLE' ? 'LOCKED' : 'AVAILABLE';
    
    // Instant UI update
    const updatedSeats = seats.map(s => 
      s._id === seat._id ? { ...s, status: newStatus } : s
    );
    setSeats(updatedSeats);

    // Save to Backend
    try {
        await axios.put(`http://localhost:5001/api/seats/${seat._id}`, { status: newStatus });
    } catch (err) { console.error(err); }
  };

  // 3. GENERATE 200 SEAT HALL (10 Rows x 20 Cols)
  const setupCinema = async () => {
    try {
      if(!window.confirm("Build new 200-Seat Hall? This will delete previous data.")) return;

      // Reset Database
      await axios.delete('http://localhost:5001/api/seats/reset');
      
      // Generate: 10 Rows * 20 Columns = 200 Seats
      await axios.post('http://localhost:5001/api/seats/generate', {
        showtimeId, rows: 10, cols: 20, price: 1500
      });
      
      fetchSeats();
    } catch (err) { alert("Error setting up cinema."); }
  };

  // Calculate Price
  const selectedSeats = seats.filter(s => s.status === 'LOCKED');
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  // Group Rows
  const rows = [...new Set(seats.map(s => s.row))].sort();

  return (
    <div className="cinema-container">
      
      <div className="header-info">
        <h2>SCOPE IMAX - HALL 1</h2>
        <p>200 SEATS | DOLBY ATMOS | 4K LASER</p>
      </div>
      
      <div className="screen-container">
        <div className="screen"></div>
      </div>

      {/* Button to Build the 200 Seat Hall */}
      {seats.length === 0 && (
        <button onClick={setupCinema} className="btn-pay" style={{marginBottom:'20px', background:'red', color:'white'}}>
            ⚠️ CLICK TO BUILD 200-SEAT HALL
        </button>
      )}

      <div className="seat-grid">
        {rows.map(row => (
          <div key={row} className="seat-row">
            <div className="row-label">{row}</div>
            
            {seats.filter(s => s.row === row).map(seat => {
                // LOGIC FOR 200 SEATS (5 - 10 - 5)
                // Gap after Seat 5 (Left Wing)
                // Gap after Seat 15 (Center Wing ends)
                const isAisle = (seat.number === 5 || seat.number === 15);
                
                return (
                    <div 
                        key={seat._id}
                        className={`seat ${seat.status} ${isAisle ? 'aisle-gap' : ''}`}
                        onClick={() => handleSeatClick(seat)}
                        title={`Row ${seat.row} Seat ${seat.number}`}
                    >
                        <small>{seat.number}</small>
                    </div>
                );
            })}

            <div className="row-label">{row}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item"><div className="legend-box" style={{borderColor:'#555'}}></div> Available</div>
        <div className="legend-item"><div className="legend-box" style={{background:'#eab308'}}></div> Selected</div>
        <div className="legend-item"><div className="legend-box" style={{background:'#ef4444'}}></div> Booked</div>
      </div>

      {/* Sticky Footer */}
      {selectedSeats.length > 0 && (
          <div className="summary-bar">
              <div>
                  <span style={{color:'#888', fontSize:'0.9rem'}}>SEATS:</span><br/>
                  <strong style={{fontSize:'1.1rem'}}>{selectedSeats.length} Selected</strong>
              </div>
              <div>
                  <span style={{color:'#888', fontSize:'0.9rem'}}>TOTAL:</span><br/>
                  <strong style={{fontSize:'1.3rem', color:'#eab308'}}>Rs. {totalPrice}</strong>
              </div>
              <button className="btn-pay">PROCEED</button>
          </div>
      )}
    </div>
  );
};

export default SeatSelection;