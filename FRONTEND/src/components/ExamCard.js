import React from "react";
import { Link } from "react-router-dom";
import "./ExamCard.css"; // Import CSS file

const ExamCard = ({ exam }) => {
  return (
    <div className="card exam-card">
      <div className="card-body text-center">
        {/* Exam Title */}
        <h5 className="card-title text-primary fw-bold">{exam.name}</h5>

        {/* Description */}
        <p className="card-text text-muted">{exam.description}</p>

        {/* View Details Button */}
        <Link to={`/exam/${exam.id}`} className="btn btn-outline-primary mt-2">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ExamCard;
