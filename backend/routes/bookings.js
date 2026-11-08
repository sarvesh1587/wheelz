const express = require("express");
const bookingRouter = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  processPayment,
  getMyStats,
  getVendorBookings,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");
const requireKYC = require("../middleware/requireKYC");
const handover = require("../controllers/handoverController");
const { photos } = require("../middleware/uploadHandover");

// All routes require authentication
bookingRouter.use(protect);

// Booking creation with KYC check
bookingRouter.post("/", requireKYC, createBooking);
bookingRouter.get("/", getBookings);
bookingRouter.get("/my-stats", getMyStats);
bookingRouter.get("/:id", getBooking);
bookingRouter.put("/:id/cancel", cancelBooking);
bookingRouter.put("/:id/payment", authorize("admin"), processPayment);

// Pickup / return handover and disputes (see controllers/handoverController.js)
bookingRouter.get("/:id/handover", handover.getHandover);
bookingRouter.post("/:id/pickup", photos, handover.recordPickup);
bookingRouter.post("/:id/return", photos, handover.recordReturn);
bookingRouter.post("/:id/acknowledge", photos, handover.acknowledge);
bookingRouter.post("/:id/disputes", photos, handover.openDispute);
bookingRouter.post("/:id/disputes/:disputeId/respond", photos, handover.respondToDispute);

// Vendor route
bookingRouter.get(
  "/vendor/my-bookings",
  authorize("vendor"),
  getVendorBookings,
);

module.exports = bookingRouter;
