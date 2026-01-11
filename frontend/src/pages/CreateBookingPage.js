import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import './Booking.css'; 

const CreateBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Open the backpack (Get data from Seat Page)
  const bookingData = location.state || {}; 
  const { seats, showtimeId, totalPrice } = bookingData;

  const [movieDetails, setMovieDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- THE BULLETPROOF MOVIE FETCHER ---
  useEffect(() => {
    const fetchMovieInfo = async () => {
        if (!showtimeId) return;

        try {
            console.log("1. Fetching Showtime for ID:", showtimeId);
            const showtimeRes = await axios.get(`http://localhost:5001/api/showtimes/${showtimeId}`);
            const data = showtimeRes.data;
            
            console.log("2. Showtime Data Received:", data);

            // DETECT MOVIE ID (Checks multiple locations)
            // It might be data.movie, or data.data.movie, or data.showtime.movie
            let rawMovie = data.movie || (data.data && data.data.movie) || (data.showtime && data.showtime.movie);

            let movieId = null;
            let movieTitle = null;

            // ANALYZE WHAT WE FOUND
            if (!rawMovie) {
                console.error("Could not find 'movie' field in response");
            } else if (typeof rawMovie === 'object' && rawMovie.title) {
                // Case A: We got the full movie object already!
                console.log("Found Full Movie Object");
                setMovieDetails(rawMovie);
                return;
            } else if (typeof rawMovie === 'object' && rawMovie._id) {
                // Case B: We got an object, but need to extract the ID
                movieId = rawMovie._id;
            } else {
                // Case C: It's just a String ID (Most Common)
                movieId = rawMovie;
            }

            // STEP 3: FETCH MOVIE DETAILS (If we only have an ID)
            if (movieId) {
                console.log("3. Fetching Movie Details for ID:", movieId);
                const movieRes = await axios.get(`http://localhost:5001/api/movies/${movieId}`);
                
                // Hunt for the title in the second response
                const mData = movieRes.data;
                console.log("4. Movie API Response:", mData);

                // Check common spots for title
                movieTitle = mData.title || (mData.movie && mData.movie.title) || (mData.data && mData.data.title);
                
                if (movieTitle) {
                    setMovieDetails({ title: movieTitle });
                } else {
                    setMovieDetails({ title: "Title Not Found in API" });
                }
            } else {
                setMovieDetails({ title: "Movie ID Missing" });
            }

        } catch (err) {
            console.error("CRITICAL ERROR:", err);
            setMovieDetails({ title: "Network Error" });
        }
    };

    fetchMovieInfo();
  }, [showtimeId]);

  const handleConfirmBooking = async () => {
    // Prevent double submission
    if (isProcessing) {
        console.log('Booking already in progress...');
        return;
    }

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to complete booking!");
        navigate('/login');
        return;
    }

     // Get actual user ID
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user._id || user.id;
    
    if (!userId) {
        alert("User information missing. Please login again.");
        navigate('/login');
        return;
    }

    setIsProcessing(true);
    
    try {
        const payload = {
            userId: userId, 
            showtimeId: showtimeId,
            seatIds: seats.map(s => s._id),
            totalPrice: totalPrice
        };

        await axios.post('http://localhost:5001/api/bookings', payload);
        navigate('/booking-success');
    } catch (error) {
        console.error("Booking Error:", error);
        alert("Payment failed.");
        setIsProcessing(false);
    }
  };

  return (
    <div className="booking-container">
      <button 
        onClick={() => navigate(-1)} 
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
      <div className="booking-card">
        
        {/* Title */}
        <h1>CONFIRM BOOKING</h1>
        
        <div className="summary-details">
            {/* Movie Name Row */}
            <div className="detail-row">
                <span className="label">Movie Name</span>
                <span className="value">
                    {/* Now this will show the Real Title! */}
                    {movieDetails ? movieDetails.title : "Loading..."}
                </span>
            </div>

            {/* Seats Row */}
            <div className="detail-row">
                <span className="label">Selected Seats</span>
                <span className="value">
                    {seats ? seats.map(s => `${s.row}${s.number}`).join(', ') : 'None'}
                </span>
            </div>
        </div>

        {/* Price Section */}
        <div className="price-section">
            <span className="price-label">Total Amount</span>
            <span className="price-amount">Rs. {totalPrice || 0}</span>
        </div>

        {/* Confirm Button */}
        <div className="confirm-btn-container">
            <button 
                onClick={handleConfirmBooking} 
                className="confirm-btn"
                disabled={isProcessing}
                style={{
                    opacity: isProcessing ? 0.6 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
            >
                {isProcessing ? 'PROCESSING...' : 'CONFIRM & PAY NOW'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default CreateBookingPage;