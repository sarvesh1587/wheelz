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
  createPaymentOrder,
  verifyPayment,
  completeTrip,
  cancelTrip,
  sendMessage,
  getMessages,
  rateUser,
  getDriverEarnings,
} = require("../controllers/tripShareController");
const { protect, optionalAuth } = require("../middleware/auth");

// ── Public Routes ───────────────────────────────────────────────────────────
router.get("/search", optionalAuth, searchTrips);

// ── Driver Routes (MUST come before /:id) ───────────────────────────────────
router.post("/", protect, createTrip);
router.get("/my/trips", protect, getMyTrips);
router.get("/driver/requests", protect, getDriverRequests);

// ✅ IMPORTANT: Put specific routes BEFORE generic /:id route
router.get("/:tripId/requests", protect, getTripRequests); // ✅ MOVED HERE
router.put("/:tripId/complete", protect, completeTrip);
router.put("/:tripId/cancel", protect, cancelTrip);
router.get("/earnings/me", protect, getDriverEarnings);

// ── Generic route (must be LAST) ───────────────────────────────────────────
router.get("/:id", optionalAuth, getTrip);

// ── Passenger Routes ────────────────────────────────────────────────────────
router.post("/request", protect, requestSeat);
router.get("/my/rides", protect, getMyRides);
router.put("/request/:requestId/respond", protect, respondToRequest);
router.post("/request/:requestId/pay", protect, createPaymentOrder);
router.post("/request/:requestId/verify", protect, verifyPayment);

// ── Chat Routes ─────────────────────────────────────────────────────────────
router.post("/request/:requestId/message", protect, sendMessage);
router.get("/request/:requestId/messages", protect, getMessages);

// ── Rating Routes ───────────────────────────────────────────────────────────
router.post("/request/:requestId/rate", protect, rateUser);

module.exports = router;
