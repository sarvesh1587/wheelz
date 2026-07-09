const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  googleLogin,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Security middleware
const {
  loginLimiter,
  authLimiter,
  resetLimiter,
} = require("../middleware/rateLimiter");
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateUpdateProfile,
} = require("../middleware/validate");

// Public routes with rate limiting + validation
router.post("/register", authLimiter, validateRegister, register);
router.post("/login", loginLimiter, validateLogin, login);
router.post(
  "/forgot-password",
  resetLimiter,
  validateForgotPassword,
  forgotPassword,
);
router.post(
  "/reset-password/:token",
  resetLimiter,
  validateResetPassword,
  resetPassword,
);
router.post("/google/google-login", googleLogin);

// Protected routes with validation
router.get("/me", protect, getMe);
router.put("/profile", protect, validateUpdateProfile, updateProfile);
router.put("/change-password", protect, validateChangePassword, changePassword);

module.exports = router;
