require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 5001;
const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key_please_replace";

app.use(
  cors({
    origin: ["http://192.168.100.105:3000", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(bodyParser.json());

// Test Route for Debugging
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/examApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  examHistory: [
    {
      date: { type: Date, default: Date.now },
      branch: { type: String, required: true },
      year: { type: Number, required: true },
      session: { type: Number, required: true },
      score: { type: Number, required: true },
      totalMarks: { type: Number, required: true },
      attempted: { type: Number, required: false },
      correct: { type: Number, required: false },
      incorrect: { type: Number, required: false },
    },
  ],
});

const User = mongoose.model("User", UserSchema);

// Exam Schema
const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  resources: [String],
  eligibility: { type: String },
  examMode: { type: String },
  difficulty: { type: String },
  details: {
    syllabus: {
      link: String,
      description: String,
    },
    rules: {
      link: String,
      description: String,
    },
    notesMaterials: {
      notesLink: String,
      materialLink: String,
      books: String,
    },
  },
});

const Exam = mongoose.model("Exam", ExamSchema);

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastDate: { type: String, required: true },
  link: { type: String, required: true },
});

const Notification = mongoose.model("Notification", NotificationSchema);

// Question Schema
const QuestionSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  year: { type: Number, required: true },
  session: { type: Number, required: true },
  question_number: { type: Number, required: true },
  subject: { type: String, required: true },
  questionType: { type: String, required: true, enum: ["MCQ", "MSQ", "NAT"] },
  question: { type: String, required: true },
  questionImage: { type: String, default: null },
  options: { type: [String], default: [] },
  optionImages: { type: [String], default: [] },
  marks: { type: Number, required: true },
  negativeMarks: { type: Number, default: 0 },
  correctAnswerIndex: { type: mongoose.Schema.Types.Mixed, required: true },
  solution: {
    text: { type: String, required: true },
    image: { type: String, default: null },
  },
  createdAt: { type: Date, default: Date.now },
});

const Question = mongoose.model("Question", QuestionSchema);

// Validation Middleware
const validateSignup = [
  body("username").notEmpty().withMessage("Username is required").trim(),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// Token Verification Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  console.log("Authorization Header:", token);
  if (!token) return res.status(403).json({ error: "No token provided" });

  try {
    const bearerToken = token.split(" ")[1];
    console.log("Bearer Token:", bearerToken);
    const decoded = jwt.verify(bearerToken, SECRET_KEY);
    console.log("Decoded Token:", decoded);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    console.error("Token Verification Error:", err.message);
    res.status(401).json({ error: "Unauthorized", details: err.message });
  }
};

// Authentication Routes
app.post("/signup", validateSignup, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Error registering user" });
  }
});

app.post("/login", validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Error logging in" });
  }
});

// Exam Routes
app.get("/exams", verifyToken, async (req, res) => {
  try {
    const exams = await Exam.find({
      title: { $exists: true, $ne: null },
      _id: { $exists: true, $ne: null },
    });
    console.log("Exams fetched from DB:", exams);
    res.json(exams);
  } catch (err) {
    console.error("Exams Fetch Error:", err);
    res.status(500).json({ error: "Error fetching exams" });
  }
});

app.get("/notifications", verifyToken, async (req, res) => {
  console.log("Received request for /notifications");
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    console.log("Notifications fetched from DB:", notifications);
    res.json(notifications);
  } catch (err) {
    console.error("Notifications Fetch Error:", err);
    res.status(500).json({ error: "Error fetching notifications" });
  }
});

app.get("/questions/:branch/:year/:session", verifyToken, async (req, res) => {
  console.log("Received request for /questions");
  try {
    const { branch, year, session } = req.params;
    const questions = await Question.find({
      branch: branch.toUpperCase(),
      year: parseInt(year),
      session: parseInt(session),
    }).sort({ question_number: 1 });
    console.log(`Questions fetched from DB for ${branch}-${year}-${session}:`, questions.length);
    if (questions.length === 0) {
      return res.status(404).json({ error: "No questions found for the specified exam" });
    }
    res.json(questions);
  } catch (err) {
    console.error("Questions Fetch Error:", err);
    res.status(500).json({ error: "Error fetching questions" });
  }
});

app.get("/mock-exams", verifyToken, async (req, res) => {
  try {
    const mockExams = await Question.aggregate([
      {
        $group: {
          _id: { branch: "$branch", year: "$year", session: "$session" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          branch: "$_id.branch",
          year: "$_id.year",
          session: "$_id.session",
          questionCount: "$count",
          _id: 0,
        },
      },
      { $sort: { year: -1, branch: 1, session: 1 } },
    ]);
    console.log("Mock exams fetched from DB:", mockExams);
    res.json(mockExams);
  } catch (err) {
    console.error("Mock Exams Fetch Error:", err);
    res.status(500).json({ error: "Error fetching mock exams" });
  }
});

// New Routes (placed after verifyToken)
app.post("/save-exam-result", verifyToken, async (req, res) => {
  const { branch, year, session, score, totalMarks, attempted, correct, incorrect } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.examHistory.push({
      date: new Date(),
      branch,
      year,
      session,
      score,
      totalMarks,
      attempted,
      correct,
      incorrect,
    });

    await user.save();
    res.json({ message: "Exam result saved successfully" });
  } catch (err) {
    console.error("Save Exam Result Error:", err);
    res.status(500).json({ error: "Error saving exam result" });
  }
});

app.get("/user-profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("username email examHistory");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("User Profile Fetch Error:", err);
    res.status(500).json({ error: "Error fetching user profile" });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});