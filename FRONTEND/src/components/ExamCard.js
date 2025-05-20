// ExamCard.js
import React from "react";
import { Link } from "react-router-dom";
import "./ExamCard.css";

const ExamCard = ({ exam }) => {
  if (!exam || !exam._id || !exam.title) {
    return null; // Skip rendering if exam data is incomplete
  }

  return (
    <div className="card exam-card">
      <div className="card-body text-center">
        <h5 className="card-title text-primary fw-bold">{exam.title}</h5>
        <p className="card-text text-muted">{exam.description || "No description available"}</p>
        <Link to={`/exam/${exam._id}`} className="btn btn-outline-primary mt-2">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ExamCard;