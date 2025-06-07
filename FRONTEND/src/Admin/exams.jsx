import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";

const ExamAdmin = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    resources: [],
    eligibility: "",
    examMode: "",
    difficulty: "",
    details: {
      syllabus: { link: "", description: "" },
      rules: { link: "", description: "" },
      notesMaterials: { notesLink: "", materialLink: "", books: "" },
    },
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve token
      const response = await axios.get("http://localhost:5001/admin/exams", {
        headers: {
          Authorization: `Bearer ${token}` // Attach token
        }
      });
      setExams(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch exams: " + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("details")) {
      const [section, field] = name.split(".")[1].split("-");
      setFormData({
        ...formData,
        details: {
          ...formData.details,
          [section]: {
            ...formData.details[section],
            [field]: value,
          },
        },
      });
    } else if (name === "resources") {
      setFormData({ ...formData, resources: value.split(",").map((r) => r.trim()) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5001/admin/exams/${editId}`, formData);
      } else {
        await axios.post("http://localhost:5001/admin/exams", formData);
      }
      fetchExams();
      resetForm();
    } catch (err) {
      setError("Failed to save exam: " + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (exam) => {
    setFormData({
      title: exam.title,
      subject: exam.subject,
      description: exam.description,
      resources: exam.resources || [],
      eligibility: exam.eligibility || "",
      examMode: exam.examMode || "",
      difficulty: exam.difficulty || "",
      details: {
        syllabus: {
          link: exam.details?.syllabus?.link || "",
          description: exam.details?.syllabus?.description || "",
        },
        rules: {
          link: exam.details?.rules?.link || "",
          description: exam.details?.rules?.description || "",
        },
        notesMaterials: {
          notesLink: exam.details?.notesMaterials?.notesLink || "",
          materialLink: exam.details?.notesMaterials?.materialLink || "",
          books: exam.details?.notesMaterials?.books || "",
        },
      },
    });
    setEditId(exam._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await axios.delete(`http://localhost:5001/admin/exams/${id}`);
        fetchExams();
      } catch (err) {
        setError("Failed to delete exam: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      description: "",
      resources: [],
      eligibility: "",
      examMode: "",
      difficulty: "",
      details: {
        syllabus: { link: "", description: "" },
        rules: { link: "", description: "" },
        notesMaterials: { notesLink: "", materialLink: "", books: "" },
      },
    });
    setEditId(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h2>Manage Exams</h2>
      <form onSubmit={handleSubmit} className="card p-4 mb-4">
        <div className="mb-3">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Resources (comma-separated)</label>
          <input
            type="text"
            name="resources"
            value={formData.resources.join(", ")}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Eligibility</label>
          <input
            type="text"
            name="eligibility"
            value={formData.eligibility}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Exam Mode</label>
          <input
            type="text"
            name="examMode"
            value={formData.examMode}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Difficulty</label>
          <input
            type="text"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Syllabus Link</label>
          <input
            type="url"
            name="details.syllabus-link"
            value={formData.details.syllabus.link}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Syllabus Description</label>
          <textarea
            name="details.syllabus-description"
            value={formData.details.syllabus.description}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Rules Link</label>
          <input
            type="url"
            name="details.rules-link"
            value={formData.details.rules.link}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Rules Description</label>
          <textarea
            name="details.rules-description"
            value={formData.details.rules.description}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Notes Link</label>
          <input
            type="url"
            name="details.notesMaterials-notesLink"
            value={formData.details.notesMaterials.notesLink}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Material Link</label>
          <input
            type="url"
            name="details.notesMaterials-materialLink"
            value={formData.details.notesMaterials.materialLink}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Recommended Books</label>
          <input
            type="text"
            name="details.notesMaterials-books"
            value={formData.details.notesMaterials.books}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div>
          <button type="submit" className="btn btn-primary me-2">
            {editId ? "Update Exam" : "Add Exam"}
          </button>
          <button type="button" onClick={resetForm} className="btn btn-secondary">
            Reset
          </button>
        </div>
      </form>

      <h3>Existing Exams</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Title</th>
            <th>Subject</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam._id}>
              <td>{exam.title}</td>
              <td>{exam.subject}</td>
              <td>{exam.description.substring(0, 50)}...</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(exam)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(exam._id)}
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

export default ExamAdmin;