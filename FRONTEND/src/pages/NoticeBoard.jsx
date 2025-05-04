import React from "react";

const notices = [
  {
    id: 1,
    name: "GATE - CS",
    lastDate: "5th Oct 2025",
    link: "https://gate.iitk.ac.in",
  },
  {
    id: 2,
    name: "GATE - EC",
    lastDate: "5th Oct 2025",
    link: "https://gate.iitk.ac.in",
  },
  {
    id: 3,
    name: "GATE - ME",
    lastDate: "5th Oct 2025",
    link: "https://gate.iitk.ac.in",
  },
  {
    id: 4,
    name: "GATE - EE",
    lastDate: "5th Oct 2025",
    link: "https://gate.iitk.ac.in",
  },
  {
    id: 5,
    name: "GATE Mock Test - CS",
    lastDate: "Rolling (Anytime)",
    link: "https://gate.iitk.ac.in/mock",
  },
  {
    id: 6,
    name: "GATE Mock Test - EC",
    lastDate: "Rolling (Anytime)",
    link: "https://gate.iitk.ac.in/mock",
  },
];

const NoticeBoard = () => {
  return (
    <div className="card bg-warning text-dark shadow p-3">
      <h4 className="text-center fw-bold">📢 Upcoming GATE Exams</h4>
      <ul className="list-group list-group-flush">
        {notices.map((notice) => (
          <li key={notice.id} className="list-group-item d-flex justify-content-between align-items-center">
            <strong>{notice.name}</strong>
            <span className="badge bg-danger">{notice.lastDate}</span>
            <a href={notice.link} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
              Apply
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoticeBoard;