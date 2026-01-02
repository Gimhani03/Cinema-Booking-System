import React, { useState, useRef, useEffect, useContext } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  MdMovie,
  MdMenu,
  MdNotifications,
  MdEventSeat,
  MdSchedule,
  MdTheaters,
  MdPayments,
  MdConfirmationNumber,
  MdSearch,
  MdPeople,
  MdLogin,
  MdHome,
  MdInfo
} from "react-icons/md";
import { SearchContext } from "../context/SearchContext";
import { getMovies } from "../services/movieService";
import ProfileDropdown from "./ProfileDropdown";
import "./Topbar.css";

const Topbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const [searchResults, setSearchResults] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  const role = localStorage.getItem("role"); // 'admin' | 'customer'

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setNotFound(false);
        return;
      }
      try {
        const movies = await getMovies({ title: searchQuery.trim() });
        if (movies.length > 0) {
          setSearchResults(movies);
          setNotFound(false);
        } else {
          setSearchResults([]);
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error searching movie:", error);
        setSearchResults([]);
        setNotFound(true);
      }
    };
    const delayDebounce = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleResultClick = (id) => {
    navigate(`/movies/${id}`);
    setSearchQuery("");
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    navigate("/home");
  };

  const adminLinks = (
    <>
      <NavLink to="/home" onClick={() => setMobileOpen(false)}>
        <MdHome /> Home
      </NavLink>
      <NavLink to="/admin/movies" onClick={() => setMobileOpen(false)}>
        <MdMovie /> Movies
      </NavLink>
      <NavLink to="/admin/users" onClick={() => setMobileOpen(false)}>
        <MdPeople /> Users
      </NavLink>
      <NavLink to="/admin/showtimes" onClick={() => setMobileOpen(false)}>
        <MdSchedule /> Showtimes
      </NavLink>
      <NavLink to="/halls" onClick={() => setMobileOpen(false)}>
        <MdTheaters /> Halls
      </NavLink>
      <NavLink to="/seats" onClick={() => setMobileOpen(false)}>
        <MdEventSeat /> Seats
      </NavLink>
      <NavLink to="/bookings" onClick={() => setMobileOpen(false)}>
        <MdConfirmationNumber /> Bookings
      </NavLink>
      <NavLink to="/payments" onClick={() => setMobileOpen(false)}>
        <MdPayments /> Payments
      </NavLink>
    </>
  );

  const customerLinks = (
    <>
      <NavLink to="/home" onClick={() => setMobileOpen(false)}>
        <MdHome /> Home
      </NavLink>
      <NavLink to="/movies" end onClick={() => setMobileOpen(false)}>
        <MdMovie /> Movies
      </NavLink>
      <NavLink to="/about" onClick={() => setMobileOpen(false)}>
      <MdInfo /> About Us
    </NavLink>
    </>
  );

  const isNotificationsPage = location.pathname === "/notifications";

  return (
    <nav className="topbar">
      <div className="logo">
        <NavLink to="/home" onClick={() => setMobileOpen(false)}>
          <MdMovie size={26} /> Cinema Booking
        </NavLink>
      </div>

      <div className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
        <MdMenu size={28} />
      </div>

      <div className={`nav-links ${mobileOpen ? "active" : ""}`}>
        {role === "admin" && adminLinks}
        {(role === "customer" || !isAuthenticated) && customerLinks}
        {mobileOpen && (
          <>
            <div className="mobile-menu-divider" />
            {isAuthenticated && (
              <NavLink
                to="/notifications"
                className="mobile-menu-item"
                style={{ color: isNotificationsPage ? "#ff3d00" : "#fff" }}
                onClick={() => setMobileOpen(false)}
              >
                <MdNotifications /> Notifications
              </NavLink>
            )}

            {!isAuthenticated && (
              <NavLink
                to="/login"
                className="mobile-menu-item"
                onClick={() => setMobileOpen(false)}
              >
                <MdLogin /> Login
              </NavLink>
            )}
          </>
        )}
      </div>

      <div className="topbar-right">
        <div className="search-container" ref={searchRef}>
          <MdSearch
            size={22}
            className="search-icon"
            onClick={() => setSearchOpen(!searchOpen)}
          />
          {searchOpen && (
            <div className="search-dropdown-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <div className="search-dropdown">
                {searchResults.map((movie) => (
                  <div
                    key={movie._id}
                    className="search-result-item"
                    onClick={() => handleResultClick(movie._id)}
                  >
                    {movie.title}
                  </div>
                ))}
                {notFound && (
                  <div className="search-result-item not-found">
                    Movie not found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <NavLink
            to="/notifications"
            className="notifications"
            style={{ color: isNotificationsPage ? "#ff3d00" : "#fff" }}
          >
            <MdNotifications size={22} />
            <span className="badge">3</span>
          </NavLink>
        )}

        {isAuthenticated ? (
          <ProfileDropdown onLogout={handleLogout} />
        ) : (
          <NavLink to="/login" className="login-icon-btn">
            <MdLogin size={22} />
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Topbar;