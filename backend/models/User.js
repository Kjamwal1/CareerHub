const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  emailVerified: { type: Boolean, default: false },
  profilePicture: String
});

module.exports = mongoose.model("User", userSchema);
