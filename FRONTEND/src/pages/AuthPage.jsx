import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./AuthPage.css"; 

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the type from the query parameter
  const searchParams = new URLSearchParams(location.search);
  const initialIsSignUp = searchParams.get("type") === "signup";

  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);

  useEffect(() => {
    setIsSignUp(searchParams.get("type") === "signup");
  }, [location.search]);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="text-center mb-4">{isSignUp ? "Sign Up" : "Login"}</h2>

        <form>
          {isSignUp && (
            <div className="input-group">
              <span className="input-group-text"><i className="fas fa-user"></i></span>
              <input type="text" className="form-control" placeholder="Full Name" required autoComplete="name" />
            </div>
          )}

          <div className="input-group">
            <span className="input-group-text"><i className="fas fa-envelope"></i></span>
            <input type="email" className="form-control" placeholder="Email" required autoComplete="email" />
          </div>

          <div className="input-group">
            <span className="input-group-text"><i className="fas fa-lock"></i></span>
            <input type="password" className="form-control" placeholder="Password" required autoComplete="current-password" />
          </div>

          <button className="btn btn-primary w-100 mt-3">
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="text-center mt-3">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <span 
            className="toggle-link" 
            onClick={() => navigate(`/Auth?type=${isSignUp ? "login" : "signup"}`)}
          >
            {isSignUp ? " Login" : " Sign Up"}
          </span>
        </p>

        {!isSignUp && (
          <p className="text-center">
            <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
