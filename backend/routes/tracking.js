/**
 * Live Tracking Routes
 * File: backend/routes/tracking.js
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  updateLocation,
  getLocation,
  setWaypoints,
  stopTracking,
} = require("../controllers/trackingController");

// Driver updates their location
router.post("/update", protect, updateLocation);

// Passenger gets driver location
router.get("/:requestId", protect, getLocation);

// Set pickup/drop points
router.post("/waypoints", protect, setWaypoints);

// Stop tracking after trip completes
router.put("/:requestId/stop", protect, stopTracking);

module.exports = router;
