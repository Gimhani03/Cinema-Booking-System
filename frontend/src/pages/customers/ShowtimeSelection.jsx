import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../../services/movieService";
import { getShowtimesByMovie } from "../../services/showtimeService";
import "./ShowtimeSelection.css";

const ShowtimeSelection = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieData = await getMovieById(movieId);
        setMovie(movieData);

        const showtimeData = await getShowtimesByMovie(movieId);
        const allShowtimes = showtimeData.data || [];
        setShowtimes(allShowtimes);

        if (allShowtimes.length > 0) {
            const dates = [...new Set(allShowtimes.map(st => new Date(st.date).toDateString()))];
            dates.sort((a, b) => new Date(a) - new Date(b));
            setSelectedDate(dates[0]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movieId]);

  if (loading) return <div className="loading-screen">Loading showtimes...</div>;
  if (!movie) return <div className="error-screen">Movie not found</div>;

  const uniqueDates = [...new Set(showtimes.map(st => new Date(st.date).toDateString()))];
  uniqueDates.sort((a, b) => new Date(a) - new Date(b));

  const showtimesForDate = showtimes.filter(
    st => new Date(st.date).toDateString() === selectedDate
  );

  const showtimesByHall = showtimesForDate.reduce((acc, st) => {
    // If hall name isn't populated, fallback to "Main Hall" or ID
    const hallName = st.hall?.name || "Cinema Hall"; 
    if (!acc[hallName]) acc[hallName] = [];
    acc[hallName].push(st);
    return acc;
  }, {});

  const handleTimeClick = (showtimeId) => {
    navigate(`/booking/${showtimeId}`);
  };

  return (
    <div className="selection-page">
      <div 
        className="selection-header-banner"
        style={{ backgroundImage: `linear-gradient(to right, rgba(11, 15, 25, 0.95), rgba(11, 15, 25, 0.8)), url(${movie.posterUrl})` }}
      >
        <div className="header-container">
          <div className="header-poster-wrapper">
              {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt={movie.title} className="header-poster" />
              ) : (
                  <div className="placeholder-poster">No Image</div>
              )}
          </div>
          
          <div className="header-content">
            <h1>{movie.title}</h1>
            <div className="meta-tags">
                <span className="tag rating">⭐ {movie.rating}</span>
                <span className="tag">{movie.duration} mins</span>
            </div>
            <p className="genres">
              {Array.isArray(movie.genre) ? movie.genre.join(" | ") : movie.genre}
            </p>
          </div>
        </div>
      </div>
 
      <div className="date-bar-container">
        <div className="date-bar">
            {uniqueDates.length === 0 ? (
                <div className="no-dates">No dates available</div>
            ) : (
                uniqueDates.map((dateStr) => {
                    const dateObj = new Date(dateStr);
                    const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); 
                    const dayNum = dateObj.getDate(); 
                    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
                    const isActive = selectedDate === dateStr;

                    return (
                        <button 
                            key={dateStr} 
                            className={`date-card ${isActive ? "active" : ""}`}
                            onClick={() => setSelectedDate(dateStr)}
                        >
                            <span className="date-month">{month}</span>
                            <span className="date-num">{dayNum}</span>
                            <span className="date-day">{day}</span>
                        </button>
                    );
                })
            )}
        </div>
      </div>

      <div className="times-container">
        {Object.keys(showtimesByHall).length === 0 ? (
            <div className="no-showtimes-msg">
                <h3>No showtimes scheduled for this date.</h3>
                <p>Please select another date above.</p>
            </div>
        ) : (
            Object.keys(showtimesByHall).map((hallName) => (
                <div key={hallName} className="hall-group">
                    <h3 className="hall-title">{hallName}</h3>
                    <div className="time-grid">
                        {showtimesByHall[hallName].map((st) => (
                            <button 
                                key={st._id} 
                                className="time-btn"
                                onClick={() => handleTimeClick(st._id)}
                            >
                                <span className="time-text">{st.startTime}</span>
                                <span className="price-text">Rs. {st.price}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ShowtimeSelection;