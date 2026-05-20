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

// ✅ All protected routes need authentication first
bookingRouter.use(protect);

// Public booking routes (after authentication)
bookingRouter.post("/", requireKYC, createBooking); // ✅ KYC check before booking
bookingRouter.get("/", getBookings);
bookingRouter.get("/my-stats", getMyStats);
bookingRouter.get("/:id", getBooking);
bookingRouter.put("/:id/cancel", cancelBooking);
bookingRouter.put("/:id/payment", processPayment);

// Vendor route
bookingRouter.get(
  "/vendor/my-bookings",
  authorize("vendor"),
  getVendorBookings,
);

module.exports = bookingRouter;
