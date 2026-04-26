const express = require("express");
const bookingRouter = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  processPayment,
  getMyStats,
  getVendorBookings, // ✅ ADD THIS IMPORT
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");

bookingRouter.use(protect);
bookingRouter.post("/", createBooking);
bookingRouter.get("/", getBookings);
bookingRouter.get("/my-stats", getMyStats);
bookingRouter.get("/:id", getBooking);
bookingRouter.put("/:id/cancel", cancelBooking);
bookingRouter.put("/:id/payment", processPayment);

// ✅ ADD THIS ROUTE
bookingRouter.get(
  "/vendor/my-bookings",
  authorize("vendor"),
  getVendorBookings,
);

module.exports = bookingRouter;
