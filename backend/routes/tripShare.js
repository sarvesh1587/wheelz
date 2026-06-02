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

// ========== PUBLIC ROUTES ==========
router.get("/search", optionalAuth, searchTrips);

// ========== DRIVER ROUTES ==========
router.post("/", protect, createTrip);
router.get("/my/trips", protect, getMyTrips);
router.get("/driver/requests", protect, getDriverRequests);
router.get("/earnings/me", protect, getDriverEarnings);

// ⚠️ IMPORTANT: Specific routes MUST come before generic /:id route
router.get("/:tripId/requests", protect, getTripRequests);
router.put("/:tripId/complete", protect, completeTrip);
router.put("/:tripId/cancel", protect, cancelTrip);

// ⚠️ GENERIC ROUTE - MUST BE LAST
router.get("/:id", optionalAuth, getTrip);

// ========== PASSENGER ROUTES ==========
router.post("/request", protect, requestSeat);
router.get("/my/rides", protect, getMyRides);
router.put("/request/:requestId/respond", protect, respondToRequest);
router.post("/request/:requestId/pay", protect, createPaymentOrder);
router.post("/request/:requestId/verify", protect, verifyPayment);

// ========== CHAT ROUTES ==========
router.post("/request/:requestId/message", protect, sendMessage);
router.get("/request/:requestId/messages", protect, getMessages);

// ========== RATING ROUTES ==========
router.post("/request/:requestId/rate", protect, rateUser);

module.exports = router;
