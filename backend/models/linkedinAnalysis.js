const mongoose = require("mongoose");

const LinkedInAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobDescription: { type: String, required: true },
  profileUrl: { type: String }, // Optional, for URL-based analysis
  analysis: {
    matchScore: { type: Number, required: true },
    strengths: { type: [String], required: true },
    gaps: { type: [String], required: true },
    improvements: { type: [String], required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = LinkedInAnalysisSchema;