require("dotenv").config(); 
import { Router } from "express";
import multer from "multer";
import { unlinkSync } from "fs";
import { join } from "path";
import { OpenAI } from "openai"; 

const router = Router();
const resumeRoutes = require("./routes/resume");
app.use("/api", resumeRoutes);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    cb(null, allowedTypes.includes(file.mimetype));
  },
});

router.post("/check-resume", upload.single("resume"), async (req, res) => {
  try {
    const filePath = join(__dirname, "../uploads", req.file.filename);

    // Placeholder text — swap with actual resume parsing later
    const text = `Pretend this is the text of ${req.file.originalname}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You're an expert ATS system that reviews resumes and gives scores out of 100 with concise feedback.",
        },
        {
          role: "user",
          content: `Here is a resume:\n\n${text}\n\nGive it an ATS score and feedback.`,
        },
      ],
    });

    // Delete uploaded file after use
    unlinkSync(filePath);

    const response = completion.choices[0].message.content;
    res.json({ result: response });

  } catch (err) {
    console.error("Resume processing failed:", err);
    res.status(500).json({ error: "Resume analysis failed." });
  }
});

export default router;
