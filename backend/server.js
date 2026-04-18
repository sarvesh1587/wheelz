/**
 * Wheelz Rental Management System - Express Server
 * Entry point for the backend API
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────
// app.use(helmet());
// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   }),
// );
// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());
// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

// Simplified CORS - Allow all origins (for testing)
app.use(
  cors({
    origin: true, // Allows any origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Configure CORS for production
// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:3001",
//   "https://wheelz-sand.vercel.app",
//   "https://wheelz.vercel.app",
//   "https://wheelz-git-main.vercel.app",
//   process.env.FRONTEND_URL,
// ].filter(Boolean);

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps, curl)
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.includes(origin) || origin?.includes("vercel.app")) {
//         callback(null, true);
//       } else {
//         console.log("CORS blocked origin:", origin);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   }),
// );

// Rate limiting - 100 requests per 15 min per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api/", limiter);

// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Logging ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Static Files ───────────────────────────────────────────────────────────
app.use("/uploads", express.static("uploads"));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/vehicles", require("./routes/vehicles"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/wishlist", require("./routes/wishlist"));

// ─── Health Check ───────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Wheelz API is running",
    timestamp: new Date(),
  });
});

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res
      .status(400)
      .json({ success: false, message: messages.join(", ") });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res
      .status(400)
      .json({ success: false, message: `${field} already exists` });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ─── Database Connection & Server Start ─────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/wheelz")
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(
        `🚀 Wheelz API running on port ${PORT} [${process.env.NODE_ENV}]`,
      );
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;
