/**
 * TripShare Routes - FIXED ORDER
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
  cancelRequest,
  sendMessage,
  getMessages,
  completeTrip,
  cancelTrip,
  rateUser,
  reportRide,
  getDriverEarnings,
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/tripShareController");
const { protect, optionalAuth } = require("../middleware/auth");

// ── Public ───────────────────────────────────────────────────────────────────
router.get("/search", optionalAuth, searchTrips);

// ── IMPORTANT: Named routes FIRST before any /:param routes ─────────────────
router.get("/my/trips", protect, getMyTrips);
router.get("/my/rides", protect, getMyRides);
router.get("/earnings/me", protect, getDriverEarnings);
router.get("/driver/requests", protect, getDriverRequests);

// ── Create trip ─────────────────────────────────────────────────────────────
router.post("/", protect, createTrip);

// ── Seat request ────────────────────────────────────────────────────────────
router.post("/request", protect, requestSeat);

// ── Request-specific routes (MUST be before /:tripId and /:id) ──────────────
router.put("/request/:requestId/respond", protect, respondToRequest);
router.put("/request/:requestId/cancel", protect, cancelRequest);
router.post("/request/:requestId/pay", protect, createPaymentOrder); // ← THIS IS YOUR 404
router.post("/request/:requestId/verify", protect, verifyPayment);
router.post("/request/:requestId/message", protect, sendMessage);
router.get("/request/:requestId/messages", protect, getMessages);
router.post("/request/:requestId/rate", protect, rateUser);
router.post("/request/:requestId/report", protect, reportRide);

// ── Trip-specific routes ────────────────────────────────────────────────────
router.get("/:tripId/requests", protect, getTripRequests);
router.put("/:tripId/complete", protect, completeTrip);
router.put("/:tripId/cancel", protect, cancelTrip);

// ── Generic get — MUST BE ABSOLUTE LAST ─────────────────────────────────────
router.get("/:id", optionalAuth, getTrip);

module.exports = router;
