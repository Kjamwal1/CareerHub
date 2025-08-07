const mongoose = require("mongoose");

const resumeCheckSchema = new mongoose.Schema({
  userId: String,
  filePath: String,
  uploadedAt: Date
});

module.exports = mongoose.model("ResumeCheck", resumeCheckSchema);
