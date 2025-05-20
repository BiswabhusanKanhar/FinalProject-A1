import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Exam.css";

const Exam = () => {
  const { branch, year } = useParams();
  const [questionsData, setQuestionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [markedForReview, setMarkedForReview] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [natInputs, setNatInputs] = useState([]);
  const [user, setUser] = useState(null);
  const [resultsHtml, setResultsHtml] = useState("");
  const [resultsSummary, setResultsSummary] = useState({
    attempted: 0,
    correct: 0,
    incorrect: 0,
    totalMarks: 0,
  });
  const navigate = useNavigate();

  // Fetch user data and validate token
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    console.log("Stored token in Exam.jsx:", token);
    console.log("Stored user data in Exam.jsx:", storedUser);

    if (!token) {
      console.warn("No token found, redirecting to login");
      navigate("/auth?type=login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      if (Date.now() >= expiry) {
        console.warn("Token expired, redirecting to login");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/auth?type=login");
        return;
      }
    } catch (err) {
      console.error("Invalid token, redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/auth?type=login");
      return;
    }

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log("Parsed user data in Exam.jsx:", parsedUser);
      setUser(parsedUser);
    } else {
      console.warn("No user data found, redirecting to login");
      navigate("/auth?type=login");
    }
  }, [navigate]);

  // Define submitExam
  const submitExam = useCallback(async () => {
    if (isExamSubmitted) return; // Prevent multiple submissions
    setIsExamSubmitted(true);

    let calculatedScore = 0;
    let summaryHTML = "";
    let attempted = 0;
    let correct = 0;
    let incorrect = 0;
    const totalMarks = questionsData.reduce((sum, q) => sum + q.marks, 0);

    questionsData.forEach((q, index) => {
      let isCorrect = false;
      let userAnswer = "";

      if (q.questionType === "NAT") {
        userAnswer = natInputs[index] || "";
        if (userAnswer !== "") attempted++;
        if (Array.isArray(q.correctAnswerIndex)) {
          isCorrect = q.correctAnswerIndex.some(
            (correctAns) => parseFloat(natInputs[index]) === correctAns
          );
        } else {
          isCorrect = parseFloat(natInputs[index]) === q.correctAnswerIndex;
        }
      } else {
        userAnswer =
          answers[index] !== null
            ? Array.isArray(answers[index])
              ? answers[index].map((i) => q.options[i]).join(", ")
              : q.options[answers[index]]
            : "Not Answered";
        if (answers[index] !== null) attempted++;
        if (Array.isArray(q.correctAnswerIndex)) {
          isCorrect =
            Array.isArray(answers[index]) &&
            answers[index].length === q.correctAnswerIndex.length &&
            answers[index].every((val) => q.correctAnswerIndex.includes(val));
        } else {
          isCorrect = answers[index] === q.correctAnswerIndex;
        }
      }

      if (isCorrect) {
        calculatedScore += q.marks;
        correct++;
      } else if (answers[index] !== null || natInputs[index] !== "") {
        calculatedScore -= q.negativeMarks || 0;
        incorrect++;
      }

      summaryHTML += `
        <div class="result-item ${isCorrect ? "correct" : "incorrect"}">
          <div class="result-question">
            <h4>Question ${q.question_number}</h4>
            <div class="question-text">${q.question.replace(/\n/g, "<br>")}</div>
          </div>
          <div class="result-answer">
            <p><strong>Your Answer:</strong> ${userAnswer}</p>
            <p><strong>Correct Answer:</strong> ${
              Array.isArray(q.correctAnswerIndex)
                ? q.correctAnswerIndex.map((i) => q.options?.[i] ?? i).join(", ")
                : q.options?.[q.correctAnswerIndex] ?? q.correctAnswerIndex
            }</p>
            <p class="result-status">${
              isCorrect
                ? '<span class="badge bg-success">CORRECT</span>'
                : answers[index] === null && natInputs[index] === ""
                ? '<span class="badge bg-secondary">UNANSWERED</span>'
                : '<span class="badge bg-danger">INCORRECT</span>'
            }</p>
          </div>
          ${
            q.solution?.text
              ? `
          <div class="result-solution">
            <h5>Solution:</h5>
            <div class="solution-text">${q.solution.text.replace(/\n/g, "<br>")}</div>
          </div>`
              : ""
          }
        </div>
      `;
    });

    setScore(calculatedScore.toFixed(2));
    setResultsHtml(summaryHTML);
    setResultsSummary({
      attempted,
      correct,
      incorrect,
      totalMarks,
    });

    // Save exam results to backend
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found for API call");
        return;
      }
      const apiUrl = "http://localhost:5001";
      await axios.post(
        `${apiUrl}/save-exam-result`,
        {
          branch: branch || "Unknown",
          year: parseInt(year) || 2024,
          session: 1,
          score: parseFloat(calculatedScore.toFixed(2)),
          totalMarks,
          attempted,
          correct,
          incorrect,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Exam result saved successfully");
    } catch (err) {
      console.error("Error saving exam result:", err.response?.data || err.message);
    }
  }, [answers, natInputs, questionsData, branch, year, isExamSubmitted]);

  // Fetch questions from the backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to access the exam.");
          setLoading(false);
          navigate("/auth?type=login");
          return;
        }

        const apiUrl = "http://localhost:5001";
        const response = await axios.get(
          `${apiUrl}/questions/${branch}/${year}/1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Fetched questions:", response.data);
        setQuestionsData(response.data);
        setAnswers(new Array(response.data.length).fill(null));
        setMarkedForReview(new Array(response.data.length).fill(false));
        setNatInputs(new Array(response.data.length).fill(""));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching questions:", err);
        if (err.response) {
          setError(
            `Failed to fetch questions: ${err.response.status} - ${
              err.response.data.error || err.message
            }`
          );
        } else {
          setError("Failed to fetch questions: Network error or server not reachable.");
        }
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [branch, year, navigate]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (!isExamSubmitted && timeLeft > 0 && questionsData.length > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (!isExamSubmitted) {
              submitExam();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExamSubmitted, timeLeft, questionsData, submitExam]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getQuestionStatus = (index) => {
    if (isExamSubmitted) return "answered";
    if (answers[index] !== null || natInputs[index] !== "") return "answered";
    if (markedForReview[index]) return "marked";
    return "unanswered";
  };

  const getStatusCount = () => {
    const counts = {
      answered: 0,
      marked: 0,
      unanswered: 0,
    };
    questionsData.forEach((_, index) => {
      counts[getQuestionStatus(index)]++;
    });
    return counts;
  };

  const formatQuestionText = (text) => {
    if (!text) return null;

    return text.split("\n").map((paragraph, i) => {
      const isCode =
        paragraph.trim().startsWith("#") ||
        paragraph.includes("{") ||
        paragraph.includes("}") ||
        paragraph.includes(";") ||
        paragraph.trim().startsWith("//");

      return (
        <p
          key={i}
          className={isCode ? "code-block" : ""}
          style={{ marginBottom: "0.8rem" }}
        >
          {paragraph}
        </p>
      );
    });
  };

  const displayOptions = (q) => {
    if (q.questionType === "NAT") {
      return (
        <div className="nat-input-container">
          <input
            type="number"
            className="form-control nat-input"
            value={natInputs[currentQuestion] || ""}
            onChange={(e) => {
              const newNatInputs = [...natInputs];
              newNatInputs[currentQuestion] = e.target.value;
              setNatInputs(newNatInputs);
            }}
            placeholder="Enter numerical answer"
          />
        </div>
      );
    } else if (Array.isArray(q.correctAnswerIndex)) {
      return (
        <div className="options-grid">
          {q.options.map((option, index) => (
            <div key={index} className="option-item">
              <input
                type="checkbox"
                id={`q${q.question_number}-opt${index}`}
                name={`q${q.question_number}`}
                value={index}
                checked={answers[currentQuestion]?.includes(index) || false}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  const currentSelections = newAnswers[currentQuestion] || [];

                  if (e.target.checked) {
                    newAnswers[currentQuestion] = [
                      ...currentSelections,
                      parseInt(e.target.value),
                    ];
                  } else {
                    newAnswers[currentQuestion] = currentSelections.filter(
                      (item) => item !== parseInt(e.target.value)
                    );
                  }
                  setAnswers(newAnswers);
                }}
              />
              <label htmlFor={`q${q.question_number}-opt${index}`}>
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </label>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="options-grid">
          {q.options.map((option, index) => (
            <div key={index} className="option-item">
              <input
                type="radio"
                id={`q${q.question_number}-opt${index}`}
                name={`q${q.question_number}`}
                value={index}
                checked={answers[currentQuestion] === index}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[currentQuestion] = parseInt(e.target.value);
                  setAnswers(newAnswers);
                }}
              />
              <label htmlFor={`q${q.question_number}-opt${index}`}>
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </label>
            </div>
          ))}
        </div>
      );
    }
  };

  const displayQuestion = () => {
    const q = questionsData[currentQuestion];
    const statusCounts = getStatusCount();

    return (
      <div className="question-container">
        <div className="question-header">
          <div className="question-meta">
            <span className="question-number">Question {q.question_number}</span>
            <span className="question-subject">{q.subject}</span>
            <span className="question-marks">
              {q.marks} Mark{q.marks > 1 ? "s" : ""}
            </span>
          </div>
          <div className="question-status-indicator">
            <div className={`status-dot ${getQuestionStatus(currentQuestion)}`}></div>
            <span>{getQuestionStatus(currentQuestion).toUpperCase()}</span>
          </div>
        </div>

        <div className="question-content">
          <div className="question-text">{formatQuestionText(q.question)}</div>
          {q.questionImage && (
            <div className="question-image-container">
              <img
                src={q.questionImage}
                alt={`Question ${q.question_number}`}
                className="question-image"
              />
            </div>
          )}
          <div className="options-container">{displayOptions(q)}</div>
        </div>

        <div className="question-footer">
          <div className="navigation-buttons">
            <button
              className="btn btn-outline-secondary"
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
            >
              Previous
            </button>
            <button
              className="btn btn-outline-primary"
              disabled={currentQuestion === questionsData.length - 1}
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
            >
              Next
            </button>
          </div>
          <div className="action-buttons">
            <button
              className="btn btn-warning"
              onClick={() => {
                const newMarked = [...markedForReview];
                newMarked[currentQuestion] = !markedForReview[currentQuestion];
                setMarkedForReview(newMarked);
              }}
            >
              {markedForReview[currentQuestion] ? "Unmark Review" : "Mark for Review"}
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (q.questionType === "NAT") {
                  const newNatInputs = [...natInputs];
                  newNatInputs[currentQuestion] = "";
                  setNatInputs(newNatInputs);
                } else {
                  const newAnswers = [...answers];
                  newAnswers[currentQuestion] = null;
                  setAnswers(newAnswers);
                }
              }}
            >
              Clear Response
            </button>
            <button className="btn btn-success" onClick={submitExam}>
              Submit Exam
            </button>
          </div>
        </div>
      </div>
    );
  };

  const resetExam = () => {
    setAnswers(new Array(questionsData.length).fill(null));
    setMarkedForReview(new Array(questionsData.length).fill(false));
    setNatInputs(new Array(questionsData.length).fill(""));
    setScore(0);
    setCurrentQuestion(0);
    setTimeLeft(30 * 60);
    setIsExamSubmitted(false);
    setResultsHtml("");
    setResultsSummary({ attempted: 0, correct: 0, incorrect: 0, totalMarks: 0 });
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestion(index);
  };

  const statusCounts = getStatusCount();

  const getFirstName = (name) => {
    if (!name) return "User";
    return name.split(" ")[0];
  };

  if (loading) {
    return <div>Loading exam questions...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (questionsData.length === 0) {
    return <div>No questions available for this exam.</div>;
  }

  return (
    <div className="exam-container">
      <header className="exam-header">
        <div className="exam-info">
          <h2>
            Mock Examination {branch ? `(${branch} - ${year})` : ""}
          </h2>
          <div className="exam-tags">
            <span className="badge bg-primary">
              {branch === "CS" ? "Computer Science" : branch}
            </span>
            <span className="badge bg-primary">Year {year || 2024}</span>
          </div>
        </div>
        <div className="exam-timer">
          <div className="timer-display">
            <i className="bi bi-clock"></i>
            <span>{formatTime(timeLeft)}</span>
          </div>
          <div className="user-profile">
            <span>{user ? getFirstName(user.username) : "User"}</span>
            <div className="user-avatar">
              <i className="bi bi-person-circle"></i>
            </div>
          </div>
        </div>
      </header>

      <main className="exam-main">
        <div className="question-area">
          {!isExamSubmitted ? (
            displayQuestion()
          ) : (
            <div className="results-container">
              <div className="results-header">
                <h2>Exam Results</h2>
                <div className="score-display">
                  <div className="score-card">
                    <h3>Your Score</h3>
                    <div className="score-value">
                      {score} / {resultsSummary.totalMarks}
                    </div>
                    <div className="score-percentage">
                      {((score / resultsSummary.totalMarks) * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="results-overview">
                <h3>Performance Summary</h3>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span>Total Questions:</span>
                    <span>{questionsData.length}</span>
                  </div>
                  <div className="stat-item">
                    <span>Attempted:</span>
                    <span>{resultsSummary.attempted}</span>
                  </div>
                  <div className="stat-item">
                    <span>Correct:</span>
                    <span>{resultsSummary.correct}</span>
                  </div>
                  <div className="stat-item">
                    <span>Incorrect:</span>
                    <span>{resultsSummary.incorrect}</span>
                  </div>
                  <div className="stat-item">
                    <span>Unanswered:</span>
                    <span>{questionsData.length - resultsSummary.attempted}</span>
                  </div>
                </div>
              </div>
              <div
                className="results-summary"
                dangerouslySetInnerHTML={{ __html: resultsHtml }}
              />
              <button className="btn btn-primary retry-button" onClick={resetExam}>
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="question-palette">
          <div className="palette-header">
            <h4>Question Palette</h4>
            <div className="palette-stats">
              <div className="stat-item">
                <span className="stat-dot answered"></span>
                <span>{statusCounts.answered}</span>
              </div>
              <div className="stat-item">
                <span className="stat-dot unanswered"></span>
                <span>{statusCounts.unanswered}</span>
              </div>
              <div className="stat-item">
                <span className="stat-dot marked"></span>
                <span>{statusCounts.marked}</span>
              </div>
            </div>
          </div>
          <div className="palette-grid">
            {questionsData.map((_, index) => (
              <button
                key={index}
                className={`palette-btn ${getQuestionStatus(index)} ${
                  currentQuestion === index ? "current" : ""
                }`}
                onClick={() => handleQuestionClick(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="palette-legend">
            <div className="legend-item">
              <span className="legend-dot current"></span>
              <span>Current</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot answered"></span>
              <span>Answered</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot unanswered"></span>
              <span>Unanswered</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot marked"></span>
              <span>Marked</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Exam;