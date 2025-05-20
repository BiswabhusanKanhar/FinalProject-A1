import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";

const NoticeAdmin = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    lastDate: "",
    link: "",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await axios.get("http://localhost:5001/admin/notifications");
      setNotices(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch notices: " + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5001/admin/notifications/${editId}`, formData);
      } else {
        await axios.post("http://localhost:5001/admin/notifications", formData);
      }
      fetchNotices();
      resetForm();
    } catch (err) {
      setError("Failed to save notice: " + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (notice) => {
    setFormData({
      name: notice.name,
      lastDate: notice.lastDate,
      link: notice.link,
    });
    setEditId(notice._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        await axios.delete(`http://localhost:5001/admin/notifications/${id}`);
        fetchNotices();
      } catch (err) {
        setError("Failed to delete notice: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      lastDate: "",
      link: "",
    });
    setEditId(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h2>Manage Notices</h2>
      <form onSubmit={handleSubmit} className="card p-4 mb-4">
        <div className="mb-3">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Last Date</label>
          <input
            type="text"
            name="lastDate"
            value={formData.lastDate}
            onChange={handleInputChange}
            className="form-control"
            required
            placeholder="e.g., 30th Nov 2025"
          />
        </div>
        <div className="mb-3">
          <label>Link</label>
          <input
            type="url"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div>
          <button type="submit" className="btn btn-primary me-2">
            {editId ? "Update Notice" : "Add Notice"}
          </button>
          <button type="button" onClick={resetForm} className="btn btn-secondary">
            Reset
          </button>
        </div>
      </form>

      <h3>Existing Notices</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Last Date</th>
            <th>Link</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((notice) => (
            <tr key={notice._id}>
              <td>{notice.name}</td>
              <td>{notice.lastDate}</td>
              <td>
                <a href={notice.link} target="_blank" rel="noopener noreferrer">
                  Link
                </a>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(notice)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(notice._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NoticeAdmin;