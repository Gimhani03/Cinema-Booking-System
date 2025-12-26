import React, { useState } from 'react';
import { FaUser, FaArrowLeft } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); 

    if (!email || !password) {
      alert("Email and password are required");
      return; 
    }

    setIsLoading(true);
    try {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('role', data.user.role);
    
    
    if (data.user.role === 'admin') {
      navigate("/admin/movies");
    } else {
      navigate("/home");
    }
  } catch (error) {
    alert(error.response?.data?.message || 'Login failed');
  } finally {
    setIsLoading(false);
  }
  };

  return (
    <div className="login-wrapper">
      <div className="login-form-box">
        <button className="back-button" onClick={() => navigate('/home')} type="button">
          <FaArrowLeft />
        </button>
        <form onSubmit={handleLogin}>
          <h1>Login</h1>

          <div className="login-input-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email Address"
            />
            <FaUser className="icon" />
          </div>

          <div className="login-input-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
            />
            <div className="icon" onClick={() => setShowPassword(!showPassword)} style={{cursor: 'pointer'}}>
              {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
            </div>
          </div>

          <div className="login-forgot-password">
            <label>
              <Link to="/forgot-password">Forgot Password?</Link>
            </label>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <div className="register">
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>

           <div className="admin-login">
            <p>
              Are you an admin? <Link to="/admin-login">Admin Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
