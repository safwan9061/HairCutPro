const express = require("express");

const {
  generateOTP,
  verifyOTP,
} = require("../Controllers/otpController");

const router = express.Router();

// Generate OTP
router.post("/send-otp", generateOTP);

// Verify OTP
router.post("/verify-otp", verifyOTP);

module.exports = router;