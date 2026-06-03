/**
 * TripShare Routes - CORRECTED ORDER
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
  cancelRequest,
  rateUser,
  reportRide,
  getDriverEarnings,
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/tripShareController");
const { protect, optionalAuth } = require("../middleware/auth");

// ── Public ───────────────────────────────────────────────────────────────────
router.get("/search", optionalAuth, searchTrips);

// ── Named routes FIRST (before /:id) ─────────────────────────────────────────
router.get("/my/trips", protect, getMyTrips);
router.get("/my/rides", protect, getMyRides);
router.get("/earnings/me", protect, getDriverEarnings);
router.get("/driver/requests", protect, getDriverRequests);

// ── Create trip ───────────────────────────────────────────────────────────────
router.post("/", protect, createTrip);

// ── Seat request ──────────────────────────────────────────────────────────────
router.post("/request", protect, requestSeat);

// ── Request-specific routes (these MUST come before /:tripId and /:id) ────────
router.put("/request/:requestId/respond", protect, respondToRequest);
router.put("/request/:requestId/cancel", protect, cancelRequest);
router.post("/request/:requestId/pay", protect, createPaymentOrder);
router.post("/request/:requestId/verify", protect, verifyPayment);
router.post("/request/:requestId/message", protect, sendMessage);
router.get("/request/:requestId/messages", protect, getMessages);
router.post("/request/:requestId/rate", protect, rateUser);
router.post("/request/:requestId/report", protect, reportRide);

// ── Trip-specific routes (these MUST come before /:id) ────────────────────────
router.get("/:tripId/requests", protect, getTripRequests);
router.put("/:tripId/complete", protect, completeTrip);
router.put("/:tripId/cancel", protect, cancelTrip);

// ── Generic get — MUST BE LAST ────────────────────────────────────────────────
router.get("/:id", optionalAuth, getTrip);

module.exports = router;
