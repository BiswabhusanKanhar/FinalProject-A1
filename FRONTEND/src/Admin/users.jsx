import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";

const UserAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    plan: "free"
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    console.log("Fetching users from http://localhost:5001/admin/users"); // Added for debugging
    try {
      const token = localStorage.getItem('token'); // Or wherever you store the token
      const response = await axios.get("http://localhost:5001/admin/users",{
      headers: {
        Authorization: `Bearer ${token}` // Add token to headers
      }
    });
      console.log("Users received:", response.data); // Added for debugging
      
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch users: " + (err.response?.data?.error || err.message));
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
      const token = localStorage.getItem('token');
      if (editId) {
        await axios.put(`http://localhost:5001/admin/users/${editId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        // Changed from /signup to /admin/users for admin user creation
        await axios.post("http://localhost:5001/admin/users", formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      fetchUsers();
      resetForm();
    } catch (err) {
      setError("Failed to save user: " + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      plan: user.plan || "free" // Ensure plan is set, default to "free" if missing
    });
    setEditId(user._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/admin/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchUsers();
      } catch (err) {
        setError("Failed to delete user: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      plan: "free" // Reset to default
    });
    setEditId(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h2>Manage Users</h2>
      <form onSubmit={handleSubmit} className="card p-4 mb-4">
        <div className="mb-3">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Password {editId ? "(Leave blank to keep unchanged)" : ""}</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="form-control"
            required={!editId}
          />
        </div>
        <div className="mb-3">
          <label>Plan</label>
          <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
          <option value="free">"free"</option>
          <option value="premium">"premium"</option>
          </select>
        </div>

        <div>
          <button type="submit" className="btn btn-primary me-2">
            {editId ? "Update User" : "Add User"}
          </button>
          <button type="button" onClick={resetForm} className="btn btn-secondary">
            Reset
          </button>
        </div>
      </form>

      <h3>Existing Users</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Plan</th>
            <th>Exam History</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.plan || "free"}</td>
              <td>{user.examHistory.length} exams</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(user._id)}
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

export default UserAdmin;