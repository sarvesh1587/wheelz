/**
 * Trip Planner Routes
 * Add to server.js: app.use("/api/trip-planner", require("./routes/tripPlanner"));
 */

const express = require("express");
const router = express.Router();
const {
  planTrip,
  quickEstimate,
} = require("../controllers/tripPlannerController");
const { optionalAuth } = require("../middleware/auth");

// POST /api/trip-planner/plan  — full AI plan with vehicle recommendations
router.post("/plan", optionalAuth, planTrip);

// POST /api/trip-planner/estimate  — quick cost estimate (no DB, instant)
router.post("/estimate", quickEstimate);

module.exports = router;
