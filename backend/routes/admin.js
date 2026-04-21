const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const { Booking } = require("../models/Booking");

// Get dashboard stats
router.get("/dashboard", protect, authorize("admin"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalVendors = await User.countDocuments({ role: "vendor" });
    const totalVehicles = await Vehicle.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();

    const revenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } },
    ]);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers },
        vendors: { total: totalVendors },
        vehicles: { total: totalVehicles },
        bookings: { total: totalBookings },
        revenue: { total: revenueAgg[0]?.total || 0 },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all users
router.get("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle user active status
router.put(
  "/users/:id/toggle-active",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      user.isActive = !user.isActive;
      await user.save();
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// ✅ APPROVE VENDOR - FIXED
router.put(
  "/approve-vendor/:vendorId",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const vendor = await User.findById(req.params.vendorId);

      if (!vendor) {
        return res
          .status(404)
          .json({ success: false, message: "Vendor not found" });
      }

      if (vendor.role !== "vendor") {
        return res
          .status(400)
          .json({ success: false, message: "User is not a vendor" });
      }

      vendor.isVendorApproved = true;
      vendor.isActive = true;
      await vendor.save();

      res.json({
        success: true,
        message: `${vendor.name} has been approved as a vendor`,
        vendor,
      });
    } catch (error) {
      console.error("Approve vendor error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// Get revenue breakdown
router.get(
  "/revenue/breakdown",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const breakdown = await Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
          $lookup: {
            from: "vehicles",
            localField: "vehicle",
            foreignField: "_id",
            as: "vehicleData",
          },
        },
        { $unwind: "$vehicleData" },
        {
          $group: {
            _id: "$vehicleData.category",
            revenue: { $sum: "$finalAmount" },
            count: { $sum: 1 },
          },
        },
      ]);
      res.json({ success: true, breakdown });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

module.exports = router;
