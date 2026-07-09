/**
 * Rate Limiter Middleware
 * File: backend/middleware/rateLimiter.js
 *
 * Install: npm install express-rate-limit
 *
 * Usage in routes:
 *   const { loginLimiter, apiLimiter, authLimiter } = require("./middleware/rateLimiter");
 *   router.post("/login", loginLimiter, validateLogin, login);
 */

const rateLimit = require("express-rate-limit");

// ─── Shared message format ────────────────────────────────────────────────────

function limitMessage(windowMinutes, max) {
  return {
    success: false,
    message: `Too many requests. Please try again after ${windowMinutes} minutes.`,
    retryAfter: windowMinutes,
  };
}

// ─── Global API limiter — all routes ─────────────────────────────────────────
// 300 requests per 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage(15, 300),
  skip: (req) => req.method === "OPTIONS",
});

// ─── Auth limiter — register, forgot password ─────────────────────────────────
// 20 requests per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage(15, 20),
  keyGenerator: (req) => req.ip,
});

// ─── Login limiter — strict, per IP ──────────────────────────────────────────
// 10 attempts per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage(15, 10),
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    console.warn(`⚠️  Login rate limit hit for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again in 15 minutes.",
      retryAfter: 15,
    });
  },
});

// ─── Password reset limiter ───────────────────────────────────────────────────
// 5 requests per hour per IP
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage(60, 5),
});

// ─── Payment limiter ──────────────────────────────────────────────────────────
// 30 requests per 15 min per IP
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage(15, 30),
});

// ─── Search limiter — prevent scraping ───────────────────────────────────────
// 100 requests per 5 min
const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage(5, 100),
});

// ─── Upload limiter ───────────────────────────────────────────────────────────
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage(60, 20),
});

module.exports = {
  apiLimiter,
  authLimiter,
  loginLimiter,
  resetLimiter,
  paymentLimiter,
  searchLimiter,
  uploadLimiter,
};
