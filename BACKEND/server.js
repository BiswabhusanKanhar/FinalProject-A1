require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 5001;
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/examApp")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const User = mongoose.model("User", UserSchema);

// Exam Schema
const ExamSchema = new mongoose.Schema({
    title: String,
    subject: String,
    description: String,
    resources: [String]
});

const Exam = mongoose.model("Exam", ExamSchema);

// User Signup
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });

    try {
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error registering user" });
    }
});

// User Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ error: "No token provided" });

    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Unauthorized" });
        req.userId = decoded.id;
        next();
    });
};

// Fetch Exam Details (Protected Route)
app.get("/exams", verifyToken, async (req, res) => {
    const exams = await Exam.find();
    res.json(exams);
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

