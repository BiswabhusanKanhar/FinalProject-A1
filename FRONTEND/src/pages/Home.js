import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExamContext } from "../context/ExamContext";
import ExamCard from "../components/ExamCard";
import SearchBar from "../components/SearchBar";
import NoticeBoard from "./NoticeBoard";

const Home = () => {
  const { exams } = useContext(ExamContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const filteredExams = exams.filter((exam) =>
    exam.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => setUser(null);
  const handleAuth = (type) => navigate(`/auth?type=${type}`);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">🎓 SmartPrep</Link>
          <div className="ms-auto">
            {user ? (
              <>
                <span className="text-white me-3">Welcome, {user.name}!</span>
                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/home" className="btn btn-outline-light me-2">Home</Link>
                <Link to="/about" className="btn btn-outline-light me-2">About</Link>
                <Link to="/contact" className="btn btn-outline-light me-2">Contact</Link>
                <button onClick={() => handleAuth('login')} className="btn btn-outline-light me-2">
                  Login
                </button>
                <button onClick={() => handleAuth('signup')} className="btn btn-primary">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <h1 className="text-center mb-4 text-white bg-primary py-2 rounded">
          🎓 SmartPrep 📚
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
              {filteredExams.map((exam) => (
                <div key={exam.id} className="col-md-6 col-lg-4 mb-4">
                  <ExamCard exam={exam} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
