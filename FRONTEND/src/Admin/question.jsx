import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";

const QuestionAdmin = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    branch: "",
    year: "",
    session: 1,
    question_number: "",
    subject: "",
    questionType: "MCQ",
    question: "",
    questionImage: "",
    options: ["", "", "", ""],
    optionImages: [],
    marks: "",
    negativeMarks: 0,
    correctAnswerIndex: "",
    solution: { text: "", image: "" },
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get("http://localhost:5001/admin/questions");
      setQuestions(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch questions: " + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("options")) {
      const index = parseInt(name.split("-")[1]);
      const newOptions = [...formData.options];
      newOptions[index] = value;
      setFormData({ ...formData, options: newOptions });
    } else if (name.includes("solution")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        solution: { ...formData.solution, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        year: parseInt(formData.year),
        session: parseInt(formData.session),
        question_number: parseInt(formData.question_number),
        marks: parseInt(formData.marks),
        negativeMarks: parseInt(formData.negativeMarks),
        correctAnswerIndex:
          formData.questionType === "NAT"
            ? parseFloat(formData.correctAnswerIndex)
            : formData.questionType === "MSQ"
            ? formData.correctAnswerIndex.split(",").map((i) => parseInt(i.trim()))
            : parseInt(formData.correctAnswerIndex),
      };

      if (editId) {
        await axios.put(`http://localhost:5001/admin/questions/${editId}`, payload);
      } else {
        await axios.post("http://localhost:5001/admin/questions", payload);
      }
      fetchQuestions();
      resetForm();
    } catch (err) {
      setError("Failed to save question: " + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (question) => {
    setFormData({
      branch: question.branch,
      year: question.year.toString(),
      session: question.session,
      question_number: question.question_number.toString(),
      subject: question.subject,
      questionType: question.questionType,
      question: question.question,
      questionImage: question.questionImage || "",
      options: question.options.length ? question.options : ["", "", "", ""],
      optionImages: question.optionImages || [],
      marks: question.marks.toString(),
      negativeMarks: question.negativeMarks.toString(),
      correctAnswerIndex: Array.isArray(question.correctAnswerIndex)
        ? question.correctAnswerIndex.join(", ")
        : question.correctAnswerIndex.toString(),
      solution: {
        text: question.solution?.text || "",
        image: question.solution?.image || "",
      },
    });
    setEditId(question._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await axios.delete(`http://localhost:5001/admin/questions/${id}`);
        fetchQuestions();
      } catch (err) {
        setError("Failed to delete question: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      branch: "",
      year: "",
      session: 1,
      question_number: "",
      subject: "",
      questionType: "MCQ",
      question: "",
      questionImage: "",
      options: ["", "", "", ""],
      optionImages: [],
      marks: "",
      negativeMarks: 0,
      correctAnswerIndex: "",
      solution: { text: "", image: "" },
    });
    setEditId(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h2>Manage Questions</h2>
      <form onSubmit={handleSubmit} className="card p-4 mb-4">
        <div className="row">
          <div className="col-md-3">
            <label>Branch</label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-3">
            <label>Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-3">
            <label>Session</label>
            <input
              type="number"
              name="session"
              value={formData.session}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-3">
            <label>Question Number</label>
            <input
              type="number"
              name="question_number"
              value={formData.question_number}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="mt-3">
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
        <div className="mt-3">
          <label>Question Type</label>
          <select
            name="questionType"
            value={formData.questionType}
            onChange={handleInputChange}
            className="form-control"
            required
          >
            <option value="MCQ">MCQ</option>
            <option value="MSQ">MSQ</option>
            <option value="NAT">NAT</option>
          </select>
        </div>
        <div className="mt-3">
          <label>Question Text</label>
          <textarea
            name="question"
            value={formData.question}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mt-3">
          <label>Question Image URL (Optional)</label>
          <input
            type="text"
            name="questionImage"
            value={formData.questionImage}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        {formData.questionType !== "NAT" && (
          <div className="mt-3">
            <label>Options</label>
            {formData.options.map((option, index) => (
              <input
                key={index}
                type="text"
                name={`options-${index}`}
                value={option}
                onChange={handleInputChange}
                className="form-control mb-2"
                placeholder={`Option ${index + 1}`}
              />
            ))}
          </div>
        )}
        <div className="mt-3">
          <label>Marks</label>
          <input
            type="number"
            name="marks"
            value={formData.marks}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mt-3">
          <label>Negative Marks</label>
          <input
            type="number"
            name="negativeMarks"
            value={formData.negativeMarks}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="mt-3">
          <label>Correct Answer Index (e.g., 0 for MCQ, "0,1" for MSQ, number for NAT)</label>
          <input
            type="text"
            name="correctAnswerIndex"
            value={formData.correctAnswerIndex}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mt-3">
          <label>Solution Text</label>
          <textarea
            name="solution.text"
            value={formData.solution.text}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mt-3">
          <label>Solution Image URL (Optional)</label>
          <input
            type="text"
            name="solution.image"
            value={formData.solution.image}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="mt-3">
          <button type="submit" className="btn btn-primary me-2">
            {editId ? "Update Question" : "Add Question"}
          </button>
          <button type="button" onClick={resetForm} className="btn btn-secondary">
            Reset
          </button>
        </div>
      </form>

      <h3>Existing Questions</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Branch</th>
            <th>Year</th>
            <th>Session</th>
            <th>Question #</th>
            <th>Subject</th>
            <th>Type</th>
            <th>Question</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q._id}>
              <td>{q.branch}</td>
              <td>{q.year}</td>
              <td>{q.session}</td>
              <td>{q.question_number}</td>
              <td>{q.subject}</td>
              <td>{q.questionType}</td>
              <td>{q.question.substring(0, 50)}...</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(q)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(q._id)}
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

export default QuestionAdmin;