const express = require("express");
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  resendOTP,
  isEmailVerified,
} = require("../controllers/otpController");
const { protect } = require("../middleware/auth");

// Public routes
router.post("/send", sendOTP);
router.post("/verify", verifyOTP);
router.post("/resend", resendOTP);
router.get("/check", isEmailVerified);

// Protected route (for booking verification)
router.post("/verify-booking", protect, verifyOTP);

module.exports = router;
