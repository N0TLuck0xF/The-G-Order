// Import required modules
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Secret key for JWT (Keep this secret!)
const JWT_SECRET = "your_super_secret_key_here";

// Connect to MongoDB (replace with your MongoDB URI)
mongoose.connect("mongodb://localhost:27017/thegorder", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
});

const User = mongoose.model("User", UserSchema);

// --------------------------------------
// 🔹 Register a New User (Admin Only)
// --------------------------------------
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists!" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });

    await newUser.save();
    res.json({ success: true, message: "User registered successfully!" });
});

// --------------------------------------
// 🔹 User Login
// --------------------------------------
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Find user in database
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid username or password!" });
    }

    // Compare entered password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid username or password!" });
    }

    // Generate a JWT token
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ success: true, token });
});

// --------------------------------------
// 🔹 Protected Route (Dashboard Access)
// --------------------------------------
app.get("/dashboard", (req, res) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied!" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ success: true, message: `Welcome ${decoded.username} to TheGorder Dashboard!` });
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token!" });
    }
});

// --------------------------------------
// 🔹 Start the Server
// --------------------------------------
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
