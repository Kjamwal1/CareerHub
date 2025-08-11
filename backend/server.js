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

// Middleware
app.use(
  cors({
    origin: ['https://career-hub-25.vercel.app',' http://localhost:3000' ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);
app.use(express.json());

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(500).json({ error: "Something went wrong", details: err.message });
});


// Validate environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY', 'EMAIL_USER', 'EMAIL_PASS'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not defined in .env file`);
    process.exit(1);
  }
}


// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });


// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: "/default.jpg" },
   industry: { type: String }, // Added for industry update
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

// Configure multer 
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
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

// Cover Letter Schema
const CoverLetterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  jobTitle: { type: String },
  company: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const CoverLetter = mongoose.model("CoverLetter", CoverLetterSchema);

// Save Cover Letter
app.post("/api/cover-letter", authenticateToken, async (req, res) => {
  try {
    const { content, jobTitle, company } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });
    const coverLetter = new CoverLetter({
      userId: req.user.userId,
      content,
      jobTitle,
      company,
    });
    await coverLetter.save();
    res
      .status(201)
      .json({ message: "Cover letter saved", id: coverLetter._id });
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
app.post("/api/jobs", authenticateToken, async (req, res) => {
  try {
    const { title, company, description, url, reminderDate } = req.body;
    if (!title || !company)
      return res.status(400).json({ error: "Title and company are required" });

    const job = new Job({
      userId: req.user.userId,
      title,
      company,
      description,
      url,
      reminderDate: reminderDate ? new Date(reminderDate) : null,
    });
    await job.save();
    res.status(201).json({ message: "Job saved", job });
  } catch (error) {
    console.error("Error saving job:", error.message);
    res.status(500).json({ error: "Failed to save job" });
  }
});

// Get Jobs
app.get("/api/jobs", authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Update User Industry
app.post("/api/user/industry", authenticateToken, async (req, res) => {
  try {
    const { industry } = req.body;
    console.log("Received industry update request:", { industry, userId: req.user.userId });
    if (!industry) return res.status(400).json({ error: "Industry is required" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.industry = industry;
    await user.save();
    console.log("Industry updated successfully for user:", req.user.userId);
    res.json({ message: "Industry updated", industry });
  } catch (error) {
    console.error("Error updating industry:", error.stack);
    res.status(500).json({ error: "Failed to update industry", details: error.message });
  }
});


// Resume Check Endpoint
app.post(
  "/check-resume",
  authenticateToken,
  upload.single("resume"),
  async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.file);

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
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .json({ error: "Only PDF, DOCX, JPG, and PNG files are allowed" });
    }

    const jobDescription = req.body.jobDescription || "";
    if (!jobDescription) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Job description is required" });
    }

    try {
      let textContent = "";
      if (req.file.mimetype.includes("pdf")) {
        const pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataError", (errData) => {
          console.error("PDF Parsing Error:", errData.parserError);
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          performOCR(req.file.path, res, jobDescription, req.user.userId);
        });

        pdfParser.on("pdfParser_dataReady", async (pdfData) => {
          textContent = pdfData.Pages.map((page) =>
            page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(" ")
          )
            .join("\n")
            .trim()
            .replace(/\n\s*\n/g, "\n");
          console.log("Extracted Text:", textContent);
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          const analysis = await analyzeWithGemini(textContent, jobDescription);
          const resumeAnalysis = new ResumeAnalysis({
            userId: req.user.userId,
            jobDescription,
            analysis,
          });
          await resumeAnalysis.save();
          res.json(analysis);
        });

        pdfParser.loadPDF(req.file.path);
      } else if (req.file.mimetype.includes("openxmlformats")) {
        mammoth
          .extractRawText({ path: req.file.path })
          .then(async (result) => {
            textContent = result.value.trim().replace(/\n\s*\n/g, "\n");
            console.log("Extracted DOCX Text:", textContent);
            if (!textContent) {
              performOCR(req.file.path, res, jobDescription, req.user.userId);
            } else {
              if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
              const analysis = await analyzeWithGemini(
                textContent,
                jobDescription
              );
              const resumeAnalysis = new ResumeAnalysis({
                userId: req.user.userId,
                jobDescription,
                analysis,
              });
              await resumeAnalysis.save();
              res.json(analysis);
            }
          })
          .catch((err) => {
            console.error("DOCX Parsing Error:", err.message);
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            performOCR(req.file.path, res, jobDescription, req.user.userId);
          });
      } else if (req.file.mimetype.includes("image")) {
        performOCR(req.file.path, res, jobDescription, req.user.userId);
      }
    } catch (error) {
      console.error("Unexpected Error:", error.message);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res
        .status(500)
        .json({ error: "Unexpected error during resume processing" });
    }
  }
);

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

// Job Endpoints
app.post(
  "/api/jobs",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    try {
      if (req.file) {
        // Handle CSV import
        const csvText = fs.readFileSync(req.file.path, "utf-8");
        const jobs = csvText
          .split("\n")
          .slice(1) // Skip header
          .map((line) => {
            const [title, company, description, url, reminderDate] =
              line.split(",");
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
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(201).json({ message: "Jobs imported successfully" });
      } else {
        // Handle manual job addition
        const { title, company, description, url, reminderDate } = req.body;
        if (!title || !company) {
          return res
            .status(400)
            .json({ error: "Title and company are required" });
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
      if (req.file && fs.existsSync(req.file.path))
        fs.unlinkSync(req.file.path);
      res.status(500).json({ error: "Failed to add job" });
    }
  }
);

app.get("/api/jobs", authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

app.put("/api/jobs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reminderDate } = req.body;
    const job = await Job.findOne({ _id: id, userId: req.user.userId });
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (status) job.status = status;
    if (reminderDate) job.reminderDate = new Date(reminderDate);
    await job.save();
    res.json({ message: "Job updated successfully", job });
  } catch (error) {
    console.error("Error updating job:", error.message);
    res.status(500).json({ error: "Failed to update job" });
  }
});

//Delete Job Endpoint 
app.delete("/api/jobs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Job.deleteOne({ _id: id, userId: req.user.userId });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error.message);
    res.status(500).json({ error: "Failed to delete job" });
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
        html: `<p>Dear ${
          user.name
        },</p><p>This is a reminder to follow up on your job application for ${
          job.title
        } at ${job.company}. Status: ${job.status}.${
          job.reminderDate
            ? ` Reminder set for: ${new Date(
                job.reminderDate
              ).toLocaleString()}`
            : ""
        }</p><p><a href="${job.url || "#"}">View Job</a></p>`,
      };
      await transporter.sendMail(email);
      console.log(`Email reminder sent to ${user.email} for job ${job.title}`);
    }
  } catch (error) {
    console.error("Cron job error:", error.message);
  }
});


// Signup Endpoint
app.post("/api/auth/signup", async (req, res) => {
  console.log("Signup request received:", req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
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
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

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
    res
      .status(500)
      .json({ error: "Failed to create account. Please try again later." });
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

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

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
    res
      .status(500)
      .json({ error: "Failed to log in. Please try again later." });
  }
});

// Function to perform OCR using pytesseract
async function performOCR(filePath, res, jobDescription, userId) {
  const tempDir = "temp_images/";
  await fs.mkdir(tempDir, {recursive: true});

  try{
    let textContent = "";
  if (filePath.endsWith(".pdf")) {
    const pdf2img = spawn("convert", [
      "-density",
      "300",
      filePath,
      `${tempDir}page-%d.jpg`,
    ]);
    pdf2img.on("close", async () => {
      try{
        const files = await fs.readdir(tempDir);
        for (const file of files) {
          const imagePath = path.join(tempDir, file);
          const process = spawn("tesseract", [
            imagePath,
            "stdout",
            "-l",
            "eng",
          ]);
          process.stdout.on("data", (data) => {
            textContent += data.toString();
          });
          process.on("close", async() => {
            await fs.unlink(imagePath).catch(() => console.error("Failed to delete image"));
          });
        }
        await fs.rm(tempDir, { recursive: true, force: true });
        await fs.unlink(filePath).catch(() => console.error("Failed to delete PDF"));
        const analysis = await analyzeWithGemini(
          textContent.trim(),
          jobDescription
        );
        const resumeAnalysis = new ResumeAnalysis({
          userId,
          jobDescription,
          analysis,
        });
        await resumeAnalysis.save();
        res.json(analysis);
      }
      catch (err) {
        console.error("Error processing PDF images:", err.message);
        res.status(500).json({ error: "Error processing PDF images" });
      }
    });
  } else if (filePath.endsWith(".jpg") || filePath.endsWith(".png")) {
      const process = spawn("tesseract", [filePath, "stdout", "-l", "eng"]);
      process.stdout.on("data", (data) => {
        textContent += data.toString();
      });
      process.on("close", async () => {
        await fs.unlink(filePath).catch(() => console.error("Failed to delete image"));
        const analysis = await analyzeWithGemini(textContent.trim(), jobDescription);
        const resumeAnalysis = new ResumeAnalysis({
          userId,
          jobDescription,
          analysis,
        });
        await resumeAnalysis.save();
        res.json(analysis);
      });
    }   else if (filePath.endsWith(".docx")) {
    const process = spawn("python", [
      "-c",
      `
import mammoth, os
from PIL import Image
with open("${filePath}", "rb") as f:
    result = mammoth.extract_raw_text(f)
    text = result.value
if not text.strip():
    images = mammoth.images.extract_images(f)
    text = ""
    for img in images:
        img.save("temp.jpg")
        text += os.popen("tesseract temp.jpg stdout -l eng").read()
        os.remove("temp.jpg")
print(text)
`,
    ]);
    process.stdout.on("data", async (data) => {
      textContent += data.toString();
    });
    process.on("close", async () => {
      await fs.unlink(filePath).catch(() => console.error("Failed to delete DOCX"));
      const analysis = await analyzeWithGemini(
        textContent.trim(),
        jobDescription
      );
      const resumeAnalysis = new ResumeAnalysis({
        userId,
        jobDescription,
        analysis,
      });
      await resumeAnalysis.save();
      res.json(analysis);
    });
  } catch (error) {
    console.error("OCR Error:", error.message);
    await fs.unlink(filePath).catch(() => console.error("Failed to delete file"));
    await fs.rm(tempDir, { recursive: true, force: true });
    res.status(500).json({ error: "Failed to process file with OCR" });
  }
}


// Function to analyze resume or profile with Gemini API
async function analyzeWithGemini(textContent, jobDescription) {
  const apiKey = process.env.GEMINI_API_KEY;
  const models = ["gemini-1.5-flash", "gemini-2.0-flash"];


  const prompt = `
Act as an HR manager with 20 years of experience. Analyze the provided LinkedIn profile against the given job description. Provide:
- A match score (0-100) indicating how well the profile aligns with the job description.
- A list of strengths (skills, experiences, or qualifications that align well with the job).
- A list of gaps (missing skills, experiences, or qualifications required by the job).
- Suggested improvements to enhance the profile.
- An optimized version of the profile's main section (e.g., Summary or Experience) rewritten with recruiter-friendly keywords based on the job description.
- A before-and-after comparison highlighting key changes in the rewritten section.
- A keyword match score (0-100) based on how well the original profile keywords match those in the job description.

Profile:
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

  for (const model of models) {
    try {
      console.log(`Attempting analysis with model: ${model}`);
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent',
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
      console.log("API Response:", result);
      return JSON.parse(result.replace(/json\n|\n/g, ""));
    } catch (error) {
      console.error(
        `Gemini API Error with ${model}:`,
        error.response ? error.response.data : error.message
      );
      if (error.response && error.response.status === 429) {
        console.log(`Quota exceeded for ${model}, trying next model...`);
        continue;
      }
      if (model === models[models.length - 1]) throw new Error(`Failed to analyze with Gemini API: ${error.message}`);
    }
  }
}
}

// Function to generate chatbot response with Gemini API
async function analyzeWithGeminiForChat(history) {
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = history
    .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
    .join("\n");
  const fullPrompt = `
You are an AI career mentor with expertise in resume optimization, LinkedIn profiling, and job matching. Continue the conversation based on the following history and provide relevant career advice, job search strategies, or profile optimization tips. Respond naturally and contextually.

Conversation History:
${prompt}

Please provide your response as plain text.
`;

  const models = ["gemini-1.5-flash", "gemini-2.0-flash"];
  for (const model of models) {
    try {
      console.log(`Attempting chat response with model: ${model}`);
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          contents: [{ parts: [{ text: fullPrompt }] }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
        }
      );

      const result = response.data.candidates[0].content.parts[0].text;
      console.log("Chat API Response:", result);
      return result.trim();
    } catch (error) {
      console.error(
        `Gemini API Error with ${model}:`,
        error.response ? error.response.data : error.message
      );
      if (error.response && error.response.status === 429) {
        console.log(`Quota exceeded for ${model}, trying next model...`);
        continue;
      }

      if (model === models[models.length - 1]) throw new Error(`Failed to generate chatbot response: ${error.message}`);
    }
  }
}
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
