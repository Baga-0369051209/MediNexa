const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// ✅ Initialize Express App
const app = express();
const PORT = process.env.PORT || 5001;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ User Schema (MongoDB Model)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model("User", UserSchema);

// ✅ List of Available Doctors
const doctors = [
    { name: "Dr. Padmapriya", specialty: "General Physician", conditions: ["cold", "flu", "fever"] },
    { name: "Dr. Shanmugasundar", specialty: "Cardiologist", conditions: ["chest pain", "abnormal pressure", "fast heart beat"] },
    { name: "Dr. Naveen", specialty: "Orthopedic", conditions: ["bone pain", "muscle pain", "joint pain"] },
];

// ✅ Function to Recommend a Doctor Based on Symptoms
function recommendDoctor(symptom) {
    symptom = symptom.toLowerCase();
    const foundDoctor = doctors.find(doctor =>
        doctor.conditions.some(condition => symptom.includes(condition))
    );
    return foundDoctor ? `🔹 Recommended Doctor: **${foundDoctor.name}** (Specialist: ${foundDoctor.specialty})` : "No specific doctor recommendation.";
}

// ✅ Signup Route
app.post("/api/auth/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Login Route
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ AI Chat Route (Symptom Analysis & Doctor Recommendation)
app.post("/api/chat", async (req, res) => {
    const { symptom } = req.body;

    if (!symptom) {
        return res.status(400).json({ error: "Please enter symptoms!" });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const chatResponse = await model.generateContent([`Explain the condition for symptom: ${symptom} in simple terms.`]);

        const responseText = chatResponse?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "AI response not available.";

        // ✅ Check for doctor recommendation
        const doctorSuggestion = recommendDoctor(symptom);

        console.log("✅ AI Response:", responseText);
        res.json({ response: `${responseText}\n\n${doctorSuggestion}` });
    } catch (error) {
        console.error("❌ Gemini API Error:", error);
        res.status(500).json({ error: "AI service unavailable" });
    }
});

// ✅ Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
