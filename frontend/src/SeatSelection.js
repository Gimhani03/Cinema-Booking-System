import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './SeatMap.css'; 

const SeatSelection = () => {
  const params = useParams();
  const showtimeId = params.showtimeId || params.id;

  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/seats/${showtimeId}`);
        setSeats(res.data);
      } catch (err) {
        console.error("Error fetching seats:", err);
      } finally {
        setLoading(false);
      }
    };
    if (showtimeId) fetchSeats();
  }, [showtimeId]);

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked' || seat.status === 'locked') return;
    if (selectedSeatIds.includes(seat._id)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seat._id));
    } else {
      setSelectedSeatIds([...selectedSeatIds, seat._id]);
    }
  };

  const selectedSeats = seats.filter(seat => selectedSeatIds.includes(seat._id));
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);

  if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Loading...</div>;

  const rows = [...new Set(seats.map(s => s.row))].sort();

  return (
    <div className="cinema-container">
      <div className="header-info">
        <h2>SELECT YOUR SEATS</h2>
      </div>
      
      <div className="screen-container">
        <div className="screen">SCREEN</div>
      </div>

      <div className="seat-grid">
        {rows.map(row => {
            // Get all seats in this row
            const rowSeats = seats.filter(s => s.row === row);
            
            // Find the highest seat number to determine row width
            // e.g., if we have seats 1, 3, 5 -> max is 5.
            const maxSeatNr = Math.max(...rowSeats.map(s => s.number));

            // Create an array for rendering: [1, 2, 3, 4, 5...]
            const renderSlots = Array.from({ length: maxSeatNr }, (_, i) => i + 1);

            return (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
                
                {renderSlots.map(seatNum => {
                    // Try to find the seat for this number
                    const seat = rowSeats.find(s => s.number === seatNum);

                    if (!seat) {
                        // GAP DETECTED! Render invisible box
                        return <div key={`gap-${row}-${seatNum}`} className="seat gap"></div>;
                    }

                    // SEAT DETECTED! Render actual seat
                    const isSelected = selectedSeatIds.includes(seat._id);
                    const isBooked = seat.status === 'booked' || seat.status === 'locked';
                    
                    return (
                        <div 
                            key={seat._id}
                            className={`seat ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}`}
                            onClick={() => handleSeatClick(seat)}
                            title={`Rs. ${seat.price}`}
                        >
                            <small>{seat.number}</small>
                        </div>
                    );
                })}
              </div>
            );
        })}
      </div>

      {selectedSeatIds.length > 0 && (
          <div className="summary-bar">
              <div>
                <strong>{selectedSeatIds.length} Seats</strong>
                <div style={{fontSize: '0.8em', color: '#ccc'}}>Rs. {totalPrice}</div>
              </div>
              <button className="btn-pay">PAY NOW</button>
          </div>
      )}
    </div>
  );
};

export default SeatSelection;