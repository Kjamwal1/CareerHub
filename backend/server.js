const express = require("express");
const multer = require("multer");
const PDFParser = require("pdf2json");
const mammoth = require("mammoth");
const cors = require("cors");
const fs = require("fs").promises;
const { spawn } = require("child_process");
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
require("dotenv").config({ quiet: true });

const app = express();

// CORS Middleware
app.use(cors({
  origin: ["https://career-hub-25.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

// Validate environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "GEMINI_API_KEY", "EMAIL_USER", "EMAIL_PASS"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not defined in .env file`);
    process.exit(1);
  }
}

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running", timestamp: new Date().toISOString() });
});

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: "/default.jpg" },
  plan: { type: String, default: "Free" },
  industry: { type: String },
});

const User = mongoose.model("User", UserSchema);

// Resume Analysis Schema
const ResumeAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobDescription: { type: String, required: true },
  analysis: {
    matchScore: { type: Number, required: true },
    strengths: { type: [String], required: true },
    gaps: { type: [String], required: true },
    improvements: { type: [String], required: true },
    optimizedSection: { type: String, required: true },
    beforeAfterComparison: { type: String, required: true },
    keywordMatchScore: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

const ResumeAnalysis = mongoose.model("ResumeAnalysis", ResumeAnalysisSchema);

// LinkedIn Analysis Schema
const LinkedInAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobDescription: { type: String, required: true },
  analysis: {
    matchScore: { type: Number, required: true },
    strengths: { type: [String], required: true },
    gaps: { type: [String], required: true },
    improvements: { type: [String], required: true },
    optimizedSection: { type: String, required: true },
    beforeAfterComparison: { type: String, required: true },
    keywordMatchScore: { type: Number, required: true },
    profileCompleteness: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

const LinkedInAnalysis = mongoose.model("LinkedInAnalysis", LinkedInAnalysisSchema);

// Chat Schema
const ChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  history: [
    {
      role: String,
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Chat = mongoose.model("Chat", ChatSchema);

// Job Schema
const JobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String },
  url: { type: String },
  status: {
    type: String,
    enum: ["Applied", "Interview Scheduled", "Offer", "Rejected"],
    default: "Applied",
  },
  reminderDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const Job = mongoose.model("Job", JobSchema);

// Document Schema
const DocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Document = mongoose.model("Document", DocumentSchema);

// Cover Letter Schema
const CoverLetterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  jobTitle: { type: String },
  company: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const CoverLetter = mongoose.model("CoverLetter", CoverLetterSchema);

// Multer Configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = "uploads/";
    try {
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "text/plain",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, JPG, PNG, and TXT files are allowed"));
    }
  },
});

// Utility Function for File Cleanup
async function cleanupFiles(...paths) {
  for (const filePath of paths) {
    try {
      if (await fs.access(filePath).then(() => true).catch(() => false)) {
        await fs.unlink(filePath);
      }
    } catch (err) {
      console.error(`Error cleaning up file ${filePath}:`, err.message);
    }
  }
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err.message);
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Signup Endpoint
app.post("/api/auth/signup", async (req, res) => {
  console.log("Signup request received:", req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      profileImage: "/kanika.jpg",
      plan: "Free",
    });

    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      user: {
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        plan: user.plan,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to create account. Please try again later." });
  }
});

// Login Endpoint
app.post("/api/auth/login", async (req, res) => {
  console.log("Login request received:", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      user: {
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        plan: user.plan,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Failed to log in. Please try again later." });
  }
});

// Update User Industry
app.post("/api/user/industry", authenticateToken, async (req, res) => {
  try {
    const { industry } = req.body;
    console.log("Received industry update request:", { industry, userId: req.user.userId });
    if (!industry) {
      return res.status(400).json({ error: "Industry is required" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.industry = industry;
    await user.save();
    console.log("Industry updated successfully for user:", req.user.userId);
    res.json({ message: "Industry updated", industry });
  } catch (error) {
    console.error("Error updating industry:", error.stack);
    res.status(500).json({ error: "Failed to update industry", details: error.message });
  }
});

// Save Cover Letter
app.post("/api/cover-letter", authenticateToken, async (req, res) => {
  try {
    const { content, jobTitle, company } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }
    const coverLetter = new CoverLetter({
      userId: req.user.userId,
      content,
      jobTitle,
      company,
    });
    await coverLetter.save();
    res.status(201).json({ message: "Cover letter saved", id: coverLetter._id });
  } catch (error) {
    console.error("Error saving cover letter:", error.message);
    res.status(500).json({ error: "Failed to save cover letter" });
  }
});

// Get Cover Letters
app.get("/api/cover-letters", authenticateToken, async (req, res) => {
  try {
    const coverLetters = await CoverLetter.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(coverLetters);
  } catch (error) {
    console.error("Error fetching cover letters:", error.message);
    res.status(500).json({ error: "Failed to fetch cover letters" });
  }
});

// Save Job
app.post("/api/jobs", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    if (req.file) {
      // Handle CSV import
      const csvText = await fs.readFile(req.file.path, "utf-8");
      const jobs = csvText
        .split("\n")
        .slice(1)
        .map((line) => {
          const [title, company, description, url, reminderDate] = line.split(",");
          return {
            userId: req.user.userId,
            title,
            company,
            description,
            url,
            status: "Applied",
            reminderDate: reminderDate ? new Date(reminderDate) : null,
          };
        })
        .filter((job) => job.title && job.company);
      await Job.insertMany(jobs);
      await cleanupFiles(req.file.path);
      res.status(201).json({ message: "Jobs imported successfully" });
    } else {
      // Handle manual job addition
      const { title, company, description, url, reminderDate } = req.body;
      if (!title || !company) {
        return res.status(400).json({ error: "Title and company are required" });
      }
      const job = new Job({
        userId: req.user.userId,
        title,
        company,
        description,
        url,
        status: "Applied",
        reminderDate: reminderDate ? new Date(reminderDate) : null,
      });
      await job.save();
      res.status(201).json({ message: "Job added successfully", job });
    }
  } catch (error) {
    console.error("Error adding jobs:", error.message);
    if (req.file) await cleanupFiles(req.file.path);
    res.status(500).json({ error: "Failed to add job" });
  }
});

// Explicit OPTIONS handler for /api/jobs
app.options("/api/jobs", (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://career-hub-25.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(200).end();
});

// Get Jobs
app.get("/api/jobs", authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Update Job
app.put("/api/jobs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reminderDate } = req.body;
    const job = await Job.findOne({ _id: id, userId: req.user.userId });
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (status) job.status = status;
    if (reminderDate) job.reminderDate = new Date(reminderDate);
    await job.save();
    res.json({ message: "Job updated successfully", job });
  } catch (error) {
    console.error("Error updating job:", error.message);
    res.status(500).json({ error: "Failed to update job" });
  }
});

// Delete Job
app.delete("/api/jobs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Job.deleteOne({ _id: id, userId: req.user.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error.message);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

// Save Chat History
app.post("/api/chat/save", authenticateToken, async (req, res) => {
  try {
    const { history } = req.body;
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: "Invalid chat history provided" });
    }
    let chat = await Chat.findOne({ userId: req.user.userId });
    if (chat) {
      chat.history = history;
      await chat.save();
    } else {
      chat = new Chat({ userId: req.user.userId, history });
      await chat.save();
    }
    res.json({ message: "Chat history saved" });
  } catch (error) {
    console.error("Save chat history error:", error.message);
    res.status(500).json({ error: "Failed to save chat history" });
  }
});

// Get Chat History
app.get("/api/chat/history", authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user.userId });
    res.json({ history: chat ? chat.history : [] });
  } catch (error) {
    console.error("Fetch chat history error:", error.message);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Chatbot Endpoint
app.post("/api/chat", authenticateToken, async (req, res) => {
  console.log("Chat request received:", req.body);
  const { history } = req.body;
  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: "Invalid chat history provided" });
  }

  try {
    const response = await analyzeWithGeminiForChat(history);
    console.log("Chat response generated:", response);
    res.json({ response });
  } catch (error) {
    console.error("Chatbot Error:", error.message);
    res.status(500).json({ error: "Failed to process chat request" });
  }
});

// Resume Check Endpoint
app.post("/check-resume", authenticateToken, upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ];
  if (!allowedTypes.includes(req.file.mimetype)) {
    await cleanupFiles(req.file.path);
    return res.status(400).json({ error: "Only PDF, DOCX, JPG, and PNG files are allowed" });
  }

  const jobDescription = req.body.jobDescription || "";
  if (!jobDescription) {
    await cleanupFiles(req.file.path);
    return res.status(400).json({ error: "Job description is required" });
  }

  try {
    let textContent = "";
    if (req.file.mimetype.includes("pdf")) {
      textContent = await extractTextFromPDF(req.file.path);
      if (!textContent || textContent.length < 50) {
        textContent = await performOCR(req.file.path);
      }
    } else if (req.file.mimetype.includes("openxmlformats")) {
      const result = await mammoth.extractRawText({ path: req.file.path });
      textContent = result.value.trim().replace(/\n\s*\n/g, "\n");
      if (!textContent || textContent.length < 50) {
        textContent = await performOCR(req.file.path);
      }
    } else if (req.file.mimetype.includes("image")) {
      textContent = await performOCR(req.file.path);
    }

    if (!textContent || textContent.length < 50) {
      await cleanupFiles(req.file.path);
      return res.status(400).json({ error: "Failed to extract meaningful text from resume" });
    }

    const analysis = await analyzeWithGemini(textContent, jobDescription, "resume");
    const resumeAnalysis = new ResumeAnalysis({
      userId: req.user.userId,
      jobDescription,
      analysis,
    });
    await resumeAnalysis.save();
    await cleanupFiles(req.file.path);
    res.json(analysis);
  } catch (error) {
    console.error("Resume processing error:", error.message, error.stack);
    await cleanupFiles(req.file.path);
    res.status(500).json({
      error: "Unexpected error during resume processing",
      details: error.message,
    });
  }
});

// LinkedIn Analysis Endpoint
app.post("/api/linkedin-analyze", authenticateToken, upload.single("linkedinPdf"), async (req, res) => {
  console.log("LinkedIn Analysis Request:", { body: req.body, file: req.file });

  if (!req.file) {
    return res.status(400).json({ error: "No LinkedIn PDF uploaded" });
  }

  if (req.file.mimetype !== "application/pdf") {
    await cleanupFiles(req.file.path);
    return res.status(400).json({ error: "Only PDF files are allowed for LinkedIn analysis" });
  }

  const jobDescription = req.body.jobDescription || "";
  if (!jobDescription) {
    await cleanupFiles(req.file.path);
    return res.status(400).json({ error: "Job description is required" });
  }

  try {
    let textContent = await extractTextFromPDF(req.file.path);
    if (!textContent || textContent.length < 50) {
      console.log("Insufficient text extracted from PDF, falling back to OCR");
      textContent = await performOCR(req.file.path, true);
    }

    if (!textContent || textContent.length < 50) {
      await cleanupFiles(req.file.path);
      return res.status(400).json({ error: "Failed to extract meaningful text from LinkedIn PDF" });
    }

    const analysis = await analyzeWithGemini(textContent, jobDescription, "linkedin");
    const linkedinAnalysis = new LinkedInAnalysis({
      userId: req.user.userId,
      jobDescription,
      analysis,
    });
    await linkedinAnalysis.save();
    await cleanupFiles(req.file.path);
    res.json(analysis);
  } catch (error) {
    console.error("LinkedIn processing error:", error.message, error.stack);
    await cleanupFiles(req.file.path);
    res.status(500).json({
      error: "Unexpected error during LinkedIn PDF processing",
      details: error.message,
    });
  }
});

// Extract Text from PDF
async function extractTextFromPDF(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error("PDF Parsing Error:", errData.parserError);
      resolve("");
    });
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const textContent = pdfData.Pages.map((page) =>
        page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(" ")
      )
        .join("\n")
        .trim()
        .replace(/\n\s*\n/g, "\n");
      console.log("Extracted PDF Text:", textContent);
      resolve(textContent);
    });
    pdfParser.loadPDF(filePath);
  });
}

// Perform OCR
async function performOCR(filePath, isLinkedIn = false) {
  const tempDir = "temp_images/";
  await fs.mkdir(tempDir, { recursive: true });

  try {
    if (filePath.endsWith(".pdf")) {
      const pdf2img = spawn("convert", [
        "-density",
        "300",
        "-quality",
        "100",
        filePath,
        `${tempDir}page-%d.jpg`,
      ]);

      await new Promise((resolve, reject) => {
        pdf2img.on("close", (code) => (code === 0 ? resolve() : reject(new Error("PDF to image conversion failed"))));
      });

      const files = await fs.readdir(tempDir);
      let textContent = "";
      for (const file of files) {
        const imagePath = path.join(tempDir, file);
        const process = spawn("tesseract", [
          imagePath,
          "stdout",
          "-l",
          isLinkedIn ? "eng+fra" : "eng",
          "--oem",
          "3",
          "--psm",
          isLinkedIn ? "6" : "3",
        ]);

        textContent += await new Promise((resolve) => {
          let output = "";
          process.stdout.on("data", (data) => (output += data.toString()));
          process.on("close", () => resolve(output));
        });

        await cleanupFiles(imagePath);
      }
      await fs.rm(tempDir, { recursive: true, force: true });
      return textContent.trim();
    } else if (filePath.endsWith(".jpg") || filePath.endsWith(".png")) {
      const process = spawn("tesseract", [filePath, "stdout", "-l", isLinkedIn ? "eng+fra" : "eng"]);
      const textContent = await new Promise((resolve) => {
        let output = "";
        process.stdout.on("data", (data) => (output += data.toString()));
        process.on("close", () => resolve(output));
      });
      return textContent.trim();
    }
    return "";
  } catch (error) {
    console.error("OCR Error:", error.message);
    await fs.rm(tempDir, { recursive: true, force: true });
    return "";
  }
}

// Analyze with Gemini API
async function analyzeWithGemini(textContent, jobDescription, type = "resume") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const prompt = type === "linkedin"
    ? `
Act as an HR manager with 20 years of experience specializing in LinkedIn profile optimization. Analyze the provided LinkedIn profile PDF text against the given job description. Provide:
- A match score (0-100) indicating how well the profile aligns with the job description.
- A list of strengths (skills, experiences, or qualifications that align well with the job).
- A list of gaps (missing skills, experiences, or qualifications required by the job).
- Suggested improvements to enhance the LinkedIn profile (e.g., update About section, add skills).
- An optimized version of the LinkedIn profile's main section (e.g., About or Skills) rewritten with recruiter-friendly keywords.
- A before-and-after comparison highlighting key changes in the rewritten section.
- A keyword match score (0-100) based on how well the original profile keywords match the job description.
- A profile completeness score (0-100) based on LinkedIn profile best practices (e.g., presence of photo, headline, About section, skills).

LinkedIn Profile Text:
${textContent}

Job Description:
${jobDescription}

Return the response in JSON format:
{
  "matchScore": number,
  "strengths": string[],
  "gaps": string[],
  "improvements": string[],
  "optimizedSection": string,
  "beforeAfterComparison": string,
  "keywordMatchScore": number,
  "profileCompleteness": number
}
`
    : `
Act as an HR manager with 20 years of experience. Analyze the provided resume against the given job description. Provide:
- A match score (0-100) indicating how well the resume aligns with the job description.
- A list of strengths (skills, experiences, or qualifications that align well with the job).
- A list of gaps (missing skills, experiences, or qualifications required by the job).
- Suggested improvements to enhance the resume.
- An optimized version of the resume's main section (e.g., Summary or Experience) rewritten with recruiter-friendly keywords.
- A before-and-after comparison highlighting key changes in the rewritten section.
- A keyword match score (0-100) based on how well the original resume keywords match the job description.

Resume:
${textContent}

Job Description:
${jobDescription}

Return the response in JSON format:
{
  "matchScore": number,
  "strengths": string[],
  "gaps": string[],
  "improvements": string[],
  "optimizedSection": string,
  "beforeAfterComparison": string,
  "keywordMatchScore": number
}
`;

  const models = ["gemini-1.5-flash", "gemini-1.5-pro"];
  let lastError;

  for (const model of models) {
    try {
      console.log(`Attempting analysis with model: ${model}`);
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
        }
      );

      const result = response.data.candidates[0].content.parts[0].text;
      console.log("Raw Gemini API Response:", result);

      const cleanedResult = result
        .replace(/```json\n|```/g, "")
        .replace(/`/g, "")
        .replace(/\n\s*\n/g, "\n")
        .trim();

      let data;
      try {
        data = JSON.parse(cleanedResult);
      } catch (parseError) {
        console.error("JSON Parsing Error:", parseError.message, "Raw Response:", result);
        throw new Error("Invalid JSON response from Gemini API");
      }

      const normalizedData = {
        matchScore: Number(data.matchScore) || 0,
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        gaps: Array.isArray(data.gaps) ? data.gaps : [],
        improvements: Array.isArray(data.improvements) ? data.improvements : [],
        optimizedSection: data.optimizedSection || "",
        beforeAfterComparison: data.beforeAfterComparison || "",
        keywordMatchScore: Number(data.keywordMatchScore) || 0,
      };
      if (type === "linkedin") {
        normalizedData.profileCompleteness = Number(data.profileCompleteness) || 0;
      }

      return normalizedData;
    } catch (error) {
      console.error(`Gemini API Error with ${model}:`, error.response ? error.response.data : error.message);
      lastError = error;
      if (error.response && error.response.status === 429) {
        console.log(`Quota exceeded for ${model}, trying next model...`);
        continue;
      }
      if (model === models[models.length - 1]) {
        throw new Error(`Failed to analyze with Gemini API: ${lastError.message}`);
      }
    }
  }
}

// Chatbot Analysis with Gemini
async function analyzeWithGeminiForChat(history) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const prompt = `
Act as a career coach with 20 years of experience. Given the chat history below, provide a concise, actionable, and professional response to the user's latest message. Focus on career advice, resume optimization, or job application strategies as relevant.

Chat History:
${JSON.stringify(history, null, 2)}

Return the response as a plain string.
`;

  const models = ["gemini-1.5-flash", "gemini-1.5-pro"];
  let lastError;

  for (const model of models) {
    try {
      console.log(`Attempting chat analysis with model: ${model}`);
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
        }
      );

      const result = response.data.candidates[0].content.parts[0].text;
      return result.trim();
    } catch (error) {
      console.error(`Gemini API Error with ${model}:`, error.response ? error.response.data : error.message);
      lastError = error;
      if (error.response && error.response.status === 429) {
        console.log(`Quota exceeded for ${model}, trying next model...`);
        continue;
      }
      if (model === models[models.length - 1]) {
        throw new Error(`Failed to analyze with Gemini API: ${lastError.message}`);
      }
    }
  }
}

// Get Resume Analyses
app.get("/api/resume-analyses", authenticateToken, async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(analyses);
  } catch (error) {
    console.error("Error fetching resume analyses:", error.message);
    res.status(500).json({ error: "Failed to fetch resume analyses" });
  }
});

// Get LinkedIn Analyses
app.get("/api/linkedin-analyses", authenticateToken, async (req, res) => {
  try {
    const analyses = await LinkedInAnalysis.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(analyses);
  } catch (error) {
    console.error("Error fetching LinkedIn analyses:", error.message);
    res.status(500).json({ error: "Failed to fetch LinkedIn analyses" });
  }
});

// Documents Endpoint
app.post("/api/documents", authenticateToken, upload.array("files", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const savedDocuments = [];
    for (const file of req.files) {
      const document = new Document({
        userId: req.user.userId,
        filename: file.filename,
        path: file.path,
      });
      await document.save();
      savedDocuments.push({
        _id: document._id,
        filename: document.filename,
        url: `/uploads/${document.filename}`,
        createdAt: document.createdAt,
      });
    }
    res.status(201).json(savedDocuments);
  } catch (error) {
    console.error("Error uploading documents:", error.message);
    for (const file of req.files || []) {
      await cleanupFiles(file.path);
    }
    res.status(500).json({ error: "Failed to upload documents" });
  }
});

// Get Documents
app.get("/api/documents", authenticateToken, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(
      documents.map((doc) => ({
        _id: doc._id,
        filename: doc.filename,
        url: `/uploads/${doc.filename}`,
        createdAt: doc.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching documents:", error.message);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// Cron Job for Email Reminders
cron.schedule("0 9 * * *", async () => {
  console.log("Running job reminder cron job at", new Date().toLocaleString());
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const jobs = await Job.find({
      reminderDate: { $gte: now, $lte: tomorrow },
      status: { $in: ["Applied", "Interview Scheduled"] },
    }).populate("userId");
    for (const job of jobs) {
      const user = job.userId;
      const email = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Reminder: Follow up on ${job.title} at ${job.company}`,
        html: `<p>Dear ${user.name},</p><p>This is a reminder to follow up on your job application for ${job.title} at ${job.company}. Status: ${job.status}.${job.reminderDate ? ` Reminder set for: ${new Date(job.reminderDate).toLocaleString()}` : ""}</p><p><a href="${job.url || "#"}">View Job</a></p>`,
      };
      await transporter.sendMail(email);
      console.log(`Email reminder sent to ${user.email} for job ${job.title}`);
    }
  } catch (error) {
    console.error("Cron job error:", error.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));