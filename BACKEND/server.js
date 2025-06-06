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
  .connect("mongodb://localhost:27017/examApp") // Removed deprecated options
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
  plan: { type: String, required: true, enum: ["free", "premium"], default: "free", trim: true }
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
      user: { email: user.email, username: user.username, plan: user.plan },
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

// Existing Routes
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

// Admin Routes (No Authentication for Testing)
app.get("/admin/users", async (req, res) => {
  console.log("GET /admin/users called"); // Added for debugging
  try {
    const users = await User.find().select("username email examHistory");
    res.json(users);
  } catch (err) {
    console.error("Admin Users Fetch Error:", err);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// New POST route for admin user creation
app.post("/admin/users", async (req, res) => {
  console.log("POST /admin/users called"); // Added for debugging
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error("Admin User Create Error:", err);
    res.status(500).json({ error: "Error creating user" });
  }
});

app.put("/admin/users/:id", async (req, res) => {
  console.log("PUT /admin/users/:id called"); // Added for debugging
  const { username, email, password } = req.body;
  try {
    const updateData = { username, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Admin User Update Error:", err);
    res.status(500).json({ error: "Error updating user" });
  }
});

app.delete("/admin/users/:id", async (req, res) => {
  console.log("DELETE /admin/users/:id called"); // Added for debugging
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Admin User Delete Error:", err);
    res.status(500).json({ error: "Error deleting user" });
  }
});

app.get("/admin/questions", async (req, res) => {
  console.log("GET /admin/questions called"); // Added for debugging
  try {
    const questions = await Question.find().sort({ year: -1, branch: 1, session: 1 });
    res.json(questions);
  } catch (err) {
    console.error("Admin Questions Fetch Error:", err);
    res.status(500).json({ error: "Error fetching questions" });
  }
});

app.post("/admin/questions", async (req, res) => {
  console.log("POST /admin/questions called"); // Added for debugging
  try {
    const questionData = req.body;
    const question = new Question(questionData);
    await question.save();
    res.status(201).json({ message: "Question created successfully", question });
  } catch (err) {
    console.error("Admin Question Create Error:", err);
    res.status(500).json({ error: "Error creating question" });
  }
});

app.put("/admin/questions/:id", async (req, res) => {
  console.log("PUT /admin/questions/:id called"); // Added for debugging
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.json({ message: "Question updated successfully", question });
  } catch (err) {
    console.error("Admin Question Update Error:", err);
    res.status(500).json({ error: "Error updating question" });
  }
});

app.delete("/admin/questions/:id", async (req, res) => {
  console.log("DELETE /admin/questions/:id called"); // Added for debugging
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error("Admin Question Delete Error:", err);
    res.status(500).json({ error: "Error deleting question" });
  }
});

app.get("/admin/notifications", async (req, res) => {
  console.log("GET /admin/notifications called"); // Added for debugging
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("Admin Notifications Fetch Error:", err);
    res.status(500).json({ error: "Error fetching notifications" });
  }
});

app.post("/admin/notifications", async (req, res) => {
  console.log("POST /admin/notifications called"); // Added for debugging
  try {
    const notificationData = req.body;
    const notification = new Notification(notificationData);
    await notification.save();
    res.status(201).json({ message: "Notification created successfully", notification });
  } catch (err) {
    console.error("Admin Notification Create Error:", err);
    res.status(500).json({ error: "Error creating notification" });
  }
});

app.put("/admin/notifications/:id", async (req, res) => {
  console.log("PUT /admin/notifications/:id called"); // Added for debugging
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ message: "Notification updated successfully", notification });
  } catch (err) {
    console.error("Admin Notification Update Error:", err);
    res.status(500).json({ error: "Error updating notification" });
  }
});

app.delete("/admin/notifications/:id", async (req, res) => {
  console.log("DELETE /admin/notifications/:id called"); // Added for debugging
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("Admin Notification Delete Error:", err);
    res.status(500).json({ error: "Error deleting notification" });
  }
});

app.get("/admin/exams", async (req, res) => {
  console.log("GET /admin/exams called"); // Added for debugging
  try {
    const exams = await Exam.find();
    res.json(exams);
  } catch (err) {
    console.error("Admin Exams Fetch Error:", err);
    res.status(500).json({ error: "Error fetching exams" });
  }
});

app.post("/admin/exams", async (req, res) => {
  console.log("POST /admin/exams called"); // Added for debugging
  try {
    const examData = req.body;
    const exam = new Exam(examData);
    await exam.save();
    res.status(201).json({ message: "Exam created successfully", exam });
  } catch (err) {
    console.error("Admin Exam Create Error:", err);
    res.status(500).json({ error: "Error creating exam" });
  }
});

app.put("/admin/exams/:id", async (req, res) => {
  console.log("PUT /admin/exams/:id called"); // Added for debugging
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }
    res.json({ message: "Exam updated successfully", exam });
  } catch (err) {
    console.error("Admin Exam Update Error:", err);
    res.status(500).json({ error: "Error updating exam" });
  }
});

app.delete("/admin/exams/:id", async (req, res) => {
  console.log("DELETE /admin/exams/:id called"); // Added for debugging
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }
    res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    console.error("Admin Exam Delete Error:", err);
    res.status(500).json({ error: "Error deleting exam" });
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