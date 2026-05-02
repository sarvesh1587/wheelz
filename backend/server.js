const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path"); // ✅ Add this
require("dotenv").config();

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

// Simplified CORS
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Logging ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ✅ FIXED: Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Also serve from root if needed
app.use("/backend/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/vendor", require("./routes/vendor"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/vehicles", require("./routes/vehicles"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/auth/google", require("./routes/googleAuth"));
app.use("/api/kyc", require("./routes/kycRoutes"));

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
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── Database Connection & Server Start ─────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/wheelz")
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Wheelz API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;
