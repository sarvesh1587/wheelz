const express = require("express");
const router = express.Router();
const {
  createTrip,
  searchTrips,
  getTrip,
  getMyTrips,
  getMyRides,
  getDriverRequests,
  getTripRequests, // ✅ Make sure this is imported
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

// Public routes
router.get("/search", optionalAuth, searchTrips);
router.get("/:id", optionalAuth, getTrip);

// Driver routes
router.post("/", protect, createTrip);
router.get("/my/trips", protect, getMyTrips);
router.get("/driver/requests", protect, getDriverRequests);
router.get("/:tripId/requests", protect, getTripRequests); // ✅ ADD THIS LINE
router.put("/:tripId/complete", protect, completeTrip);
router.put("/:tripId/cancel", protect, cancelTrip);
router.get("/earnings/me", protect, getDriverEarnings);

// Passenger routes
router.post("/request", protect, requestSeat);
router.get("/my/rides", protect, getMyRides);
router.put("/request/:requestId/respond", protect, respondToRequest);
router.post("/request/:requestId/pay", protect, createPaymentOrder);
router.post("/request/:requestId/verify", protect, verifyPayment);

// Chat routes
router.post("/request/:requestId/message", protect, sendMessage);
router.get("/request/:requestId/messages", protect, getMessages);

// Rating routes
router.post("/request/:requestId/rate", protect, rateUser);

module.exports = router;
