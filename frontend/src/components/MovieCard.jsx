import React from "react";
import { useNavigate } from "react-router-dom";
import "./MovieCard.css";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  
  const genreText = Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre;

  return (
    <div className="movie-card">
      <div className="poster-wrapper">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="movie-poster"
        />

        <div className="movie-overlay">
          <button
            className="btn primary"
            onClick={() => navigate(`/movies/${movie._id}`)}
          >
            View Details
          </button>

          <button
            className="btn secondary"
            onClick={() => navigate(`/booking/${movie._id}`)}
          >
            Book Now
          </button>
        </div>
      </div>

      <div className="movie-info">
        <h4>{movie.title}</h4>
        <span>{genreText} | {movie.duration} mins</span>
      </div>
    </div>
  );
};

export default MovieCard;