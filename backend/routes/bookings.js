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
const requireKYC = require("../middleware/requireKYC"); // ✅ Add this

// ✅ Add requireKYC middleware to POST route (booking creation)
bookingRouter.use(protect);
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
bookingRouter.post("/", protect, requireKYC, createBooking);
module.exports = bookingRouter;
