import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch user data and exam history
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
            console.log("Token:", token); // Debug: Check token
      console.log("Stored User:", storedUser); // Debug: Check user data
        if (!token || !storedUser) {
          console.warn("No token or user found, redirecting to login");
          navigate("/auth?type=login");
          return;
        }

        // Validate token
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expiry = payload.exp * 1000;
          if (Date.now() >= expiry) {
            console.warn("Token expired, redirecting to login");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            navigate("/auth?type=login");
            return;
          }
        } catch (err) {
          console.error("Invalid token, redirecting to login");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          navigate("/auth?type=login");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Fetch exam history from backend
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
        console.log("API URL:", apiUrl);
        const response = await axios.get(`${apiUrl}/user-profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });        
        console.log("Response Data:", response.data); // Debug: See full response

        setExamHistory(response.data.examHistory || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user profile:", err);
          console.log("Response Status:", err.response?.status); // Debug: Status code
          console.log("Response Data:", err.response?.data); // Debug: Server message
          const errorMessage = err.response?.data?.error || err.message || "Unknown error";

        setError(`Failed to fetch profile data. ${errorMessage}`);
        setLoading(false);
        if (err.response?.status === 401) {
          console.warn("Unauthorized, redirecting to login");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          navigate("/auth?type=login");
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth?type=login");
  };

  const getFirstName = (name) => {
    if (!name) return "User";
    return name.split(" ")[0];
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container py-4">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container">
          <a className="navbar-brand" href="/">
            <span role="img" aria-label="Graduation cap">
              🎓
            </span>{" "}
            SmartPrep
          </a>
          <div className="ms-auto">
            {user && (
              <>
                <span className="text-white me-3">Welcome, {getFirstName(user.username)}!</span>                
                <a href="/" className="btn btn-outline-light me-2"> Back to Home </a>                
                <button className="btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <h1 className="text-center mb-4 text-white bg-primary py-2 rounded">
        <span role="img" aria-label="User">
          👤
        </span>{" "}
        User Profile
      </h1>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title">User Details</h2>
          <p><strong>Username:</strong> {user?.username || "N/A"}</p>
          <p><strong>Email:</strong> {user?.email || "N/A"}</p>
          <p><strong>Plan:</strong> {user?.plan || "N/A"}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="card-title">Exam History</h2>
          {examHistory.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Branch</th>
                    <th>Year</th>
                    <th>Session</th>
                    <th>Score</th>
                    <th>Total Marks</th>
                    <th>Attempted</th>
                    <th>Correct</th>
                    <th>Incorrect</th>
                    <th>Percentage</th>
                    <th>Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {examHistory.map((exam, index) => (
                    <tr key={index}>
                      <td>{new Date(exam.date).toLocaleDateString()}</td>
                      <td>{exam.branch}</td>
                      <td>{exam.year}</td>
                      <td>{exam.session}</td>
                      <td>{exam.score.toFixed(2)}</td>
                      <td>{exam.totalMarks}</td>
                      <td>{exam.attempted || "N/A"}</td>
                      <td>{exam.correct || "N/A"}</td>
                      <td>{exam.incorrect || "N/A"}</td>
                      <td>{((exam.score / exam.totalMarks) * 100).toFixed(2)}%</td>
                      <td>
                          {user?.plan === "premium" ? (exam.rank || "N/A"

                          ) : (
                              <span style={{ color: "gold", fontStyle: "italic" }}>
                               Please Upgrade to Premium
                              </span>
                          )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No exam history available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;