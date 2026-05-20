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

// All routes require authentication
bookingRouter.use(protect);

// Booking creation with KYC check
bookingRouter.post("/", requireKYC, createBooking);
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
