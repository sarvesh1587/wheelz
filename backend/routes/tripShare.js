/**
 * TripShare Routes
 * File: backend/routes/tripShare.js
 */

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
  sendMessage,
  getMessages,
  completeTrip,
  cancelTrip,
  rateUser,
  getDriverEarnings,
} = require("../controllers/tripShareController");
const { protect, optionalAuth } = require("../middleware/auth");

// ── Public ───────────────────────────────────────────────────────────────────
router.get("/search", optionalAuth, searchTrips);

// ── Specific named routes FIRST (before /:id) ────────────────────────────────
router.get("/my/trips", protect, getMyTrips);
router.get("/my/rides", protect, getMyRides);
router.get("/earnings/me", protect, getDriverEarnings);
router.get("/driver/requests", protect, getDriverRequests);

// ── Create trip ───────────────────────────────────────────────────────────────
router.post("/", protect, createTrip);

// ── Seat request ──────────────────────────────────────────────────────────────
router.post("/request", protect, requestSeat);
router.put("/request/:requestId/respond", protect, respondToRequest);
router.post("/request/:requestId/message", protect, sendMessage);
router.get("/request/:requestId/messages", protect, getMessages);
router.post("/request/:requestId/rate", protect, rateUser);

// ── Trip actions ──────────────────────────────────────────────────────────────
router.get("/:tripId/requests", protect, getTripRequests);
router.put("/:tripId/complete", protect, completeTrip);
router.put("/:tripId/cancel", protect, cancelTrip);
router.post("/request/:requestId/pay", protect, createPaymentOrder);
router.post("/request/:requestId/verify", protect, verifyPayment);

// ── Generic get — MUST BE LAST ────────────────────────────────────────────────
router.get("/:id", optionalAuth, getTrip);

module.exports = router;
