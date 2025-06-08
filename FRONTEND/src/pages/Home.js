// Home.js
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExamContext } from "../context/ExamContext";
import ExamCard from "../components/ExamCard";
import SearchBar from "../components/SearchBar";
import NoticeBoard from "./NoticeBoard";
import axios from "axios";

const Home = () => {
  const { exams, setExams } = useContext(ExamContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Home.js
useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found, redirecting to login");
        navigate("/auth?type=login");
        return;
      }

      // Decode token to check expiration (using a simple method without a library for now)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000; // Convert to milliseconds
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

      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
      console.log("API_URL in Home:", apiUrl);

      const response = await axios.get(`${apiUrl}/exams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetched exams (raw):", response.data);

      if (Array.isArray(response.data)) {
        const validExams = response.data.map((exam, index) => ({
          ...exam,
          _id: exam._id || `temp-id-${index}`,
        })).filter((exam) => {
          const isValid = exam && exam.title && typeof exam.title === "string";
          if (!isValid) {
            console.log("Filtered out exam:", exam);
          }
          return isValid;
        });
        console.log("Valid exams after filter:", validExams);
        setExams(validExams);
      } else {
        console.error("Expected an array of exams, got:", response.data);
        setExams([]);
      }
    } catch (err) {
      console.error("Error fetching exams:", err.response?.status, err.response?.data || err.message);
      if (err.response?.status === 401) {
        console.warn("Unauthorized, redirecting to login");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/auth?type=login");
      } else if (err.response?.status === 404) {
        console.warn("Exams endpoint not found. Check backend configuration.");
      }
      setExams([]);
    }
  };

  fetchExams();
}, [setExams, navigate]);

  const filteredExams = (Array.isArray(exams) ? exams : []).filter(
    (exam) =>
      exam &&
      exam.title &&
      typeof exam.title === "string" &&
      exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log("Filtered exams for render:", filteredExams);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth?type=login");
  };

  const handleAuth = (type) => navigate(`/auth?type=${type}`);

  const getFirstName = (name) => {
    if (!name) return "User";
    return name.split(" ")[0];
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <span role="img" aria-label="Graduation cap">
              🎓
            </span>{" "}
            SmartPrep
          </Link>
          
          <div className="ms-auto">
            {user ? (
              <>
                <span className="text-white me-3">Welcome, {getFirstName(user.username)}!</span>
                <Link to="/profile" className="btn btn-outline-light me-2">
                  Profile
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="btn btn-warning me-2">
                    Admin
                  </Link>
                )}
                <button className="btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="btn btn-outline-light me-2">
                  Home
                </Link>
                <Link to="/about" className="btn btn-outline-light me-2">
                  About
                </Link>
                <Link to="/contact" className="btn btn-outline-light me-2">
                  Contact
                </Link>
                <button
                  onClick={() => handleAuth("login")}
                  className="btn btn-outline-light me-2"
                >
                  Login
                </button>
                <button
                  onClick={() => handleAuth("signup")}
                  className="btn btn-primary"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <h1 className="text-center mb-4 text-white bg-primary py-2 rounded">
          <span role="img" aria-label="Graduation cap">
            🎓
          </span>{" "}
          SmartPrep{" "}
          <span role="img" aria-label="Books">
            📚
          </span>
        </h1>

        <div className="d-flex justify-content-center mb-4">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        <div className="row">
          <div className="col-md-4">
            <NoticeBoard />
          </div>
          <div className="col-md-8">
            <div className="row">
              {filteredExams.length > 0 ? (
                filteredExams.map((exam) => (
                  <div key={exam._id} className="col-md-6 col-lg-4 mb-4">
                    <ExamCard exam={exam} />
                  </div>
                ))
              ) : (
                <p>No exams available. Please try again or check your search query.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container mt-5">
  <h2 className="text-center mb-4">Subscription Plans</h2>
  <div className="table-responsive">
    <table className="table table-bordered text-center align-middle">
      <thead className="table-light">
        <tr>
          <th className="text-start">Benefits</th>
          <th className="text-primary fw-bold">Free</th>
          <th className="text-warning fw-bold">Premium</th>
        </tr>
      </thead>
      <tbody>
        {[
          "GATE eligibility criteria",
          "Latest year PYQs",
          "Links to apply",
          "GATE paper pattern & syllabus",
          "Mock Test of Latest year PYQ",
          "Full PYQ collection (multiple years)",
          "Mock tests with scoring (multiple years)",
          "View personal ranking & progress",

        ].map((feature, index) => (
          <tr key={index}>
            <td className="text-start">{feature}</td>
            <td>{index < 5 ? "✔️" : "❌"}</td>
            <td>✔️</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td></td>
          <td>
            <span className="fw-bold">Free</span>
          </td>
          <td>
            <div className="d-flex flex-column align-items-center">
              <h5 className="text-warning mb-2">₹199 / month</h5>
              <Link to="/payment" className="btn btn-warning">
                Upgrade to Premium
              </Link>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>



    </div>
  );
};

export default Home;