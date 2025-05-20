import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AuthPage.css";

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialIsSignUp = searchParams.get("type") === "signup";

  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSignUp(searchParams.get("type") === "signup");
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
    console.log("API_URL:", apiUrl);

    try {
      if (isSignUp) {
        const response = await axios.post(`${apiUrl}/signup`, {
          username: formData.fullName,
          email: formData.email,
          password: formData.password,
        });
        alert(response.data.message);
        navigate("/auth?type=login");
      } else {
        const response = await axios.post(`${apiUrl}/login`, {
          email: formData.email,
          password: formData.password,
        });
        console.log("Login Response:", response.data);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/");
      }
    } catch (err) {
      console.error("Auth Error:", err.response?.status, err.response?.data || err.message);
      if (err.response?.status === 404) {
        setError("API endpoint not found. Please check backend configuration.");
      } else if (err.response?.status === 400) {
        setError(err.response.data.error || "Invalid credentials");
      } else {
        setError(err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="text-center mb-4">{isSignUp ? "Sign Up" : "Login"}</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <div>
          <div className="input-group">
            {isSignUp && (
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              className="btn btn-primary w-100 mt-3"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
            </button>
          </div>
        </div>

        <p className="text-center mt-3">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <span
            className="toggle-link"
            onClick={() =>
              navigate(`/auth?type=${isSignUp ? "login" : "signup"}`)
            }
          >
            {isSignUp ? " Login" : " Sign Up"}
          </span>
        </p>

        {!isSignUp && (
          <p className="text-center">
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthPage;