/**
 * Authentication & Authorization Middleware
 * File: backend/middleware/auth.js
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Protect routes — user must be logged in ────────────────────────────────
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized. Please log in." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "wheelz_secret",
    );
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "User not found or deactivated." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

// ─── Restrict to specific roles ─────────────────────────────────────────────
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

// ─── Admin only middleware ───────────────────────────────────────────────────
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }
  next();
};

// ─── Optional auth — attach user if token exists, but don't block ───────────
exports.optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "wheelz_secret",
      );
      req.user = await User.findById(decoded.id).select("-password");
    } catch (_) {}
  }
  next();
};
