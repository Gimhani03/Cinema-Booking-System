import React, { useEffect, useState } from "react";
import MovieCard from "../../components/MovieCard";
import { getMovies } from "../../services/movieService";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "./Home.css";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);
      } catch (err) {
        console.error("Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) return <p className="loading-text">Loading movies...</p>;

  const nowShowing = movies.filter((m) => m.status === "now");
  const comingSoon = movies.filter((m) => m.status === "soon");

  // Only movies with a banner or poster for the hero slider
  const heroMovies = nowShowing.filter((m) => m.bannerUrl || m.posterUrl);

  return (
    <div className="movie-home">
      {/* HERO SLIDER */}
      <Swiper
        modules={[Autoplay]}
        loop
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        slidesPerView={1}
        className="hero-swiper"
      >
        {heroMovies.map((movie) => (
          <SwiperSlide key={movie._id}>
            <div className="hero-slide">
              <img
                src={Array.isArray(movie.bannerUrl) ? movie.bannerUrl[0] : movie.bannerUrl || movie.posterUrl}
                alt={movie.title}
                className="hero-slide-img"
              />
              <div className="hero-overlay">
                <h1 className="hero-title">{movie.title}</h1>
                <p className="hero-genre">
                  {Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre} • ⭐ {movie.rating}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* NOW SHOWING Section */}
      <section className="slider-section">
        <h2 className="section-title">Now Showing</h2>
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          breakpoints={{
            320: { slidesPerView: 1.3 },
            600: { slidesPerView: 2.3 },
            900: { slidesPerView: 3.3 },
            1200: { slidesPerView: 4.3 },
          }}
        >
          {nowShowing.map((movie) => (
            <SwiperSlide key={movie._id}>
              <MovieCard movie={movie} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* COMING SOON Section */}
      <section className="slider-section">
        <h2 className="section-title">Coming Soon</h2>
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          breakpoints={{
            320: { slidesPerView: 1.3 },
            600: { slidesPerView: 2.3 },
            900: { slidesPerView: 3.3 },
            1200: { slidesPerView: 4.3 },
          }}
        >
          {comingSoon.map((movie) => (
            <SwiperSlide key={movie._id}>
              <MovieCard movie={movie} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </div>
  );
};

export default Home;