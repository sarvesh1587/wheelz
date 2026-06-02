const express = require("express");
const router = express.Router();
const {
  createTrip,
  searchTrips,
  getTrip,
  getMyTrips,
  getMyRides,
  getDriverRequests,
  getTripRequests,
  requestSeat,
  respondToRequest,
  completeTrip,
  cancelTrip,
} = require("../controllers/tripShareController");
const { protect, optionalAuth } = require("../middleware/auth");

// Public routes
router.get("/search", optionalAuth, searchTrips);

// Driver routes - SPECIFIC ROUTES FIRST
router.post("/", protect, createTrip);
router.get("/my/trips", protect, getMyTrips);
router.get("/driver/requests", protect, getDriverRequests); // ✅ MUST HAVE
router.get("/:tripId/requests", protect, getTripRequests); // ✅ MUST HAVE
router.put("/:tripId/complete", protect, completeTrip);
router.put("/:tripId/cancel", protect, cancelTrip);

// Generic route - MUST BE LAST
router.get("/:id", optionalAuth, getTrip);

// Passenger routes
router.post("/request", protect, requestSeat);
router.get("/my/rides", protect, getMyRides);
router.put("/request/:requestId/respond", protect, respondToRequest);

module.exports = router;
