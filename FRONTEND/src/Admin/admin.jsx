import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./Admin.css";

const Admin = () => {
  return (
    <div className="admin-container">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container">
          <Link className="navbar-brand" to="/admin">
            <span role="img" aria-label="Shield">
              🛡️
            </span>{" "}
            Admin Panel
          </Link>
          <div className="ms-auto">
            <Link to="/admin/users" className="btn btn-outline-light me-2">
              Users
            </Link>
            <Link to="/admin/questions" className="btn btn-outline-light me-2">
              Questions
            </Link>
            <Link to="/admin/notices" className="btn btn-outline-light me-2">
              Notices
            </Link>
            <Link to="/admin/exams" className="btn btn-outline-light me-2">
              Exams
            </Link>
            <Link to="/" className="btn btn-outline-light">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <h1 className="text-center mb-4 text-white bg-primary py-2 rounded">
          <span role="img" aria-label="Admin">
            👑
          </span>{" "}
          Admin Dashboard
        </h1>
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;