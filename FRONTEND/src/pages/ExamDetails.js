import React, { useContext, useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ExamContext } from "../context/ExamContext";

const ExamDetails = () => {
  const { id } = useParams();
  const { exams } = useContext(ExamContext);
  const exam = exams.find((exam) => exam && exam._id && exam._id.toString() === id);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const olderYears = [2024, 2023, 2022, 2021];

  // Fetch user data and validate token
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found, redirecting to login");
      navigate("/auth?type=login");
      return;
    }

    // Decode token to check expiration
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      if (Date.now() >= expiry) {
        console.warn("Token expired, redirecting to login");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/auth?type=login");
      }
    } catch (err) {
      console.error("Invalid token, redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/auth?type=login");
    }
  }, [navigate]);

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

  if (!exam) {
    return (
      <div className="container text-center mt-5">
        <h2 className="text-danger fw-bold">Exam not found</h2>
      </div>
    );
  }

  const getBranchFromSubject = (subject) => {
    if (subject.includes("Computer Science")) return "CS";
    if (subject.includes("Electronics and Communication")) return "EC";
    if (subject.includes("Mechanical Engineering")) return "ME";
    if (subject.includes("Civil Engineering")) return "CE";
    if (subject.includes("Electrical Engineering")) return "EE";
    return subject.toUpperCase().substring(0, 2);
  };

  const branch = getBranchFromSubject(exam.subject);

  return (
    <div>
      {/* Navbar similar to Home.js */}
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
                <Link to="/" className="btn btn-outline-light me-2"> Back to Home </Link>
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

      <div className="container mt-5">
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-primary text-white text-center">
            <h3 className="fw-bold">{exam.title}</h3>
          </div>
          <div className="card-body">
            <p className="text-muted">{exam.description}</p>
          </div>
        </div>

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-info text-white">
            <h5 className="fw-bold">Syllabus (2025)</h5>
          </div>
          <div className="card-body">
            <p className="card-text">
              Official syllabus for {exam.title}.{" "}
              <a
                href={exam.details?.syllabus?.link || "https://gate2025.iisc.ac.in/syllabus"}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Full Syllabus
              </a>
            </p>
          </div>
        </div>

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-info text-white">
            <h5 className="fw-bold">Rules</h5>
          </div>
          <div className="card-body">
            <ul className="list-group list-group-flush">
              <li className="list-group-item">Admit card must be carried to the exam center.</li>
              <li className="list-group-item">Calculators are not permitted.</li>
              <li className="list-group-item">Duration: 3 hours, 65 questions.</li>
              <li className="list-group-item">
                <a
                  href={exam.details?.rules?.link || "https://gate2025.iisc.ac.in/rules"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Full Rules
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-info text-white">
            <h5 className="fw-bold">Notes or Materials</h5>
          </div>
          <div className="card-body">
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <a
                  href={exam.details?.notesMaterials?.notesLink || "https://example.com/notes"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Notes
                </a>
              </li>
              <li className="list-group-item">
                <a
                  href={exam.details?.notesMaterials?.materialLink || "https://example.com/study-material"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Study Material
                </a>
              </li>
              <li className="list-group-item">
                Recommended Books: {exam.details?.notesMaterials?.books || "Standard textbooks"}
              </li>
            </ul>
          </div>
        </div>

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-secondary text-white">
            <h5 className="fw-bold">Previous Year Questions & Mocks</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4 mb-3">
                <div className="card border-primary">
                  <div className="card-body text-center">
                    <h5 className="card-title text-primary fw-bold">
                      {currentYear} Mock Test
                    </h5>
                    <p className="card-text">Available for free!</p>
                    <Link
                      to={`/mock/${branch}/${previousYear}`}
                      className="btn btn-primary"
                    >
                      Start Mock
                    </Link>
                  </div>
                </div>
              </div>

              {olderYears.map((year) => (
                <div key={year} className="col-md-4 mb-3">
                  <div className="card border-warning">
                    <div className="card-body text-center">
                      <h5 className="card-title text-warning fw-bold">
                        {year} Mock Test
                      </h5>
                      <p className="card-text">Premium Feature</p>
                      <span className="badge bg-warning text-dark mb-2">
                        Premium Batch
                      </span>
                       {JSON.parse(localStorage.getItem("user"))?.plan === "premium" ? (
                            <Link to={`/mock/${branch}/${year}`} className="btn btn-primary w-100" >
                                Start Mock
                            </Link>
                        ) : (
                            <button className="btn btn-outline-primary w-100" disabled>
                                Upgrade to Access
                            </button>
                        )}


                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 mt-4">
          <div className="card-header bg-secondary text-white">
            <h5 className="fw-bold">Exam Details</h5>
          </div>
          <div className="card-body">
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <span role="img" aria-label="Blue circle">
                  🔹
                </span>{" "}
                Subject: {exam.subject}
              </li>
              <li className="list-group-item">
                <span role="img" aria-label="Blue circle">
                  🔹
                </span>{" "}
                Mode: {exam.examMode || "Online (CBT)"}
              </li>
              <li className="list-group-item">
                <span role="img" aria-label="Blue circle">
                  🔹
                </span>{" "}
                Difficulty: {exam.difficulty || "Moderate to High"}
              </li>
            </ul>
            {exam.title.includes("Mock Test") && (
              <p className="mt-3">
                <span role="img" aria-label="Pointing right">
                  👉
                </span>{" "}
                Click 'Register Now' to start the mock test!
              </p>
            )}
          </div>
          <div className="card-footer text-center bg-light">
              <a href="https://goaps.iitr.ac.in/login" target="_blank" rel="noopener noreferrer">
              <button className="btn btn-success">Register Now</button>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExamDetails;