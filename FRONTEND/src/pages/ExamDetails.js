import React, { useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { ExamContext } from "../context/ExamContext";

const ExamDetails = () => {
  const { id } = useParams();
  const { exams } = useContext(ExamContext);
  const exam = exams.find((exam) => exam.id.toString() === id);

  // Current year
  const currentYear = new Date().getFullYear(); // 2025
  const previousYear = currentYear - 1; // 2024
  const olderYears = [2023, 2022, 2021]; // Example older years

  if (!exam) {
    return (
      <div className="container text-center mt-5">
        <h2 className="text-danger fw-bold">Exam not found</h2>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-primary text-white text-center">
          <h3 className="fw-bold">{exam.name}</h3>
        </div>
        <div className="card-body">
          <p className="text-muted">{exam.description}</p>
        </div>
      </div>

      {/* Syllabus Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="fw-bold">Syllabus (2025)</h5>
        </div>
        <div className="card-body">
          <p className="card-text">
            {exam.details.syllabus.description}.{" "}
            <a href={exam.details.syllabus.link} target="_blank" rel="noopener noreferrer">
              View Full Syllabus
            </a>
          </p>
        </div>
      </div>

      {/* Rules Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="fw-bold">Rules</h5>
        </div>
        <div className="card-body">
          <ul className="list-group list-group-flush">
            <li className="list-group-item">Admit card must be carried to the exam center.</li>
            <li className="list-group-item">Only non-programmable calculators allowed.</li>
            <li className="list-group-item">Duration: 3 hours, 65 questions.</li>
            <li className="list-group-item">
              <a href={exam.details.rules.link} target="_blank" rel="noopener noreferrer">
                View Full Rules
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Notes or Materials Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="fw-bold">Notes or Materials</h5>
        </div>
        <div className="card-body">
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <a href={exam.details.notesMaterials.notesLink} target="_blank" rel="noopener noreferrer">
                Notes
              </a>
            </li>
            <li className="list-group-item">
              <a href={exam.details.notesMaterials.materialLink} target="_blank" rel="noopener noreferrer">
                Study Material
              </a>
            </li>
            <li className="list-group-item">Recommended Books: {exam.details.notesMaterials.books}</li>
          </ul>
        </div>
      </div>

      {/* Previous Year Questions & Mocks Card Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-secondary text-white">
          <h5 className="fw-bold">Previous Year Questions & Mocks</h5>
        </div>
        <div className="card-body">
          <div className="row">
            {/* 2024 Mock (Free) Card */}
            <div className="col-md-4 mb-3">
              <div className="card border-primary">
                <div className="card-body text-center">
                  <h5 className="card-title text-primary fw-bold">
                    {previousYear} Mock Test
                  </h5>
                  <p className="card-text">Available for free!</p>
                  <Link
                    to={`/mock/${exam.id}/${previousYear}`}
                    className="btn btn-primary"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Older Years Mocks (Premium) Cards */}
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
                    <button className="btn btn-outline-primary w-100" disabled>
                      Upgrade to Access
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Exam Details Card */}
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-header bg-secondary text-white">
          <h5 className="fw-bold">Exam Details</h5>
        </div>
        <div className="card-body">
          <ul className="list-group list-group-flush">
            <li className="list-group-item">🔹 Eligibility: {exam.eligibility}</li>
            <li className="list-group-item">🔹 Exam Mode: {exam.examMode}</li>
            <li className="list-group-item">🔹 Difficulty: {exam.difficulty}</li>
          </ul>
          {exam.name.includes("Mock Test") && (
            <p className="mt-3">👉 Click 'Register Now' to start the mock test!</p>
          )}
        </div>
        <div className="card-footer text-center bg-light">
          <button className="btn btn-success">Register Now</button>
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;