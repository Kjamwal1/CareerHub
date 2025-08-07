const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();
const emailOtpStore = {}; // temporary OTP storage

// Signup
router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, password: hashed });
    await newUser.save();

    res.json({ success: true, userId: newUser._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: "Incorrect password" });

    res.json({ success: true, email: user.email, userId: user._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Send Email OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  emailOtpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  });

  try {
    await transporter.sendMail({
      from: `Caryo <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Caryo OTP",
      html: `<h3>Your OTP is:</h3><p><strong>${otp}</strong></p>`
    });
    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: "OTP send failed", error: err.message });
  }
});

// Verify Email OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const stored = emailOtpStore[email];

  if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  await User.updateOne({ email }, { emailVerified: true });
  delete emailOtpStore[email];

  res.json({ success: true, message: "Email verified" });
});

module.exports = router;
