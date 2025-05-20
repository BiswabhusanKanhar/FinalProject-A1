// NoticeBoard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found, redirecting to login");
          setError("Please log in to view notices.");
          return;
        }

        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
        const response = await axios.get(`${apiUrl}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Fetched notices:", response.data);

        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          setNotices(response.data);
          setError(null);
        } else {
          console.error("Expected an array of notices, got:", response.data);
          setError("Invalid data format received from server.");
          setNotices([]);
        }
      } catch (error) {
        console.error("Error fetching notices:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          setError(`Failed to fetch notices: ${error.response.status} - ${error.response.data.error || error.message}`);
        } else {
          setError("Failed to fetch notices: Network error or server not reachable.");
        }
        setNotices([]);
      }
    };

    fetchNotices();
  }, []);

  return (
    <div className="card bg-warning text-dark shadow p-3">
      <h4 className="text-center fw-bold">
        <span role="img" aria-label="Loudspeaker">
          📢
        </span>{" "}
        Upcoming GATE Exams
      </h4>
      {error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : notices.length > 0 ? (
        <ul className="list-group list-group-flush">
          {notices.map((notice) => (
            <li key={notice._id} className="list-group-item d-flex justify-content-between align-items-center">
              <strong>{notice.name}</strong>
              <span className="badge bg-danger">{notice.lastDate}</span>
              <a href={notice.link} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                Apply
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center">No notices available.</div>
      )}
    </div>
  );
};

export default NoticeBoard;