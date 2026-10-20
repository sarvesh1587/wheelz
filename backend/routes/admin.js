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

// Last four characters only; encrypted values ("iv:cipher") are never sent.
const mask = (v) => {
  if (!v) return "";
  if (String(v).includes(":")) return "On file";
  return `•••• ${String(v).slice(-4)}`;
};

// One user with everything an admin needs to review them: vehicles they own,
// bookings made on those vehicles and earnings. Sensitive IDs are masked.
router.get("/users/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.individualDetails) {
      user.individualDetails.aadharNumber = mask(user.individualDetails.aadharNumber);
      user.individualDetails.panNumber = mask(user.individualDetails.panNumber);
    }
    if (user.businessDetails) user.businessDetails.panNumber = mask(user.businessDetails.panNumber);
    if (user.vendorDetails) {
      user.vendorDetails.panNumber = mask(user.vendorDetails.panNumber);
      user.vendorDetails.bankAccountNumber = mask(user.vendorDetails.bankAccountNumber);
    }
    if (user.bankDetails) user.bankDetails.accountNumber = mask(user.bankDetails.accountNumber);

    const vehicles = await Vehicle.find({ vendor: user._id })
      .select("name brand images city category basePrice currentPrice isAvailable isApproved averageRating totalReviews createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const vehicleIds = vehicles.map((v) => v._id);
    const bookings = vehicleIds.length
      ? await Booking.find({ vehicle: { $in: vehicleIds } })
          .sort({ createdAt: -1 })
          .limit(50)
          .populate("vehicle", "name images")
          .populate("user", "name email")
          .lean()
      : await Booking.find({ user: user._id })
          .sort({ createdAt: -1 })
          .limit(50)
          .populate("vehicle", "name images")
          .lean();

    const paid = bookings.filter((b) => b.paymentStatus === "paid");
    res.json({
      success: true,
      user,
      vehicles,
      bookings,
      stats: {
        vehicles: vehicles.length,
        availableVehicles: vehicles.filter((v) => v.isAvailable).length,
        bookings: bookings.length,
        revenue: paid.reduce((s, b) => s + (b.finalAmount || 0), 0),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve or revoke a vendor in one call.
router.put("/vendors/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    const approved = Boolean(req.body.approved);
    vendor.isVendorApproved = approved;
    if (approved) {
      vendor.isActive = true;
      if (!vendor.vendorSince) vendor.vendorSince = new Date();
    }
    await vendor.save();
    res.json({
      success: true,
      message: `${vendor.name} ${approved ? "approved" : "set to pending"}`,
      vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Platform reports: every number comes from the database, nothing is estimated.
// ?days=7|30|90|365 limits the time-series and transaction window.
router.get("/reports", protect, authorize("admin"), async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 365, 1), 730);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const paid = { paymentStatus: "paid" };

    const [
      totals,
      periodTotals,
      revenueByMonth,
      bookingsByWeekday,
      byCategory,
      byCity,
      statusCounts,
      fleetByCategory,
      userGrowth,
      recent,
      userCounts,
      vehicleCounts,
    ] = await Promise.all([
      Booking.aggregate([
        { $group: { _id: null, bookings: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$finalAmount", 0] } } } },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: null, bookings: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$finalAmount", 0] } } } },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
            bookings: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$finalAmount", 0] } },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1 } },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $lookup: { from: "vehicles", localField: "vehicle", foreignField: "_id", as: "v" } },
        { $unwind: { path: "$v", preserveNullAndEmptyArrays: true } },
        { $group: { _id: { d: { $dayOfWeek: "$createdAt" }, c: "$v.category" }, count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { ...paid, createdAt: { $gte: since } } },
        { $lookup: { from: "vehicles", localField: "vehicle", foreignField: "_id", as: "v" } },
        { $unwind: "$v" },
        { $group: { _id: "$v.category", revenue: { $sum: "$finalAmount" }, count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $lookup: { from: "vehicles", localField: "vehicle", foreignField: "_id", as: "v" } },
        { $unwind: "$v" },
        { $group: { _id: { $toLower: { $trim: { input: "$v.city" } } }, bookings: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$finalAmount", 0] } } } },
        { $sort: { bookings: -1 } },
        { $limit: 8 },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Vehicle.aggregate([
        { $match: { isActive: { $ne: false } } },
        { $group: { _id: "$subCategory", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, users: { $sum: 1 } } },
        { $sort: { "_id.y": 1, "_id.m": 1 } },
      ]),
      Booking.find({ createdAt: { $gte: since } })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("vehicle", "name city category")
        .populate("user", "name email")
        .select("bookingRef finalAmount status paymentStatus createdAt pickupLocation vehicle user"),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Vehicle.aggregate([
        { $group: { _id: null, total: { $sum: 1 }, available: { $sum: { $cond: ["$isAvailable", 1, 0] } }, cities: { $addToSet: "$city" } } },
      ]),
    ]);

    // Owners type cities freely ("pune", "Pune "); report them once, title-cased.
    const titleCase = (c) => String(c).trim().toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
    const roles = Object.fromEntries(userCounts.map((r) => [r._id || "unknown", r.count]));
    const fleet = vehicleCounts[0] || { total: 0, available: 0, cities: [] };

    res.json({
      success: true,
      range: { days, since },
      kpis: {
        totalRevenue: totals[0]?.revenue || 0,
        totalBookings: totals[0]?.bookings || 0,
        periodRevenue: periodTotals[0]?.revenue || 0,
        periodBookings: periodTotals[0]?.bookings || 0,
        customers: roles.customer || 0,
        vendors: roles.vendor || 0,
        vehicles: fleet.total,
        availableVehicles: fleet.available,
        cities: [...new Set(fleet.cities.filter(Boolean).map(titleCase))].sort(),
      },
      revenueByMonth: revenueByMonth.map((r) => ({ year: r._id.y, month: r._id.m, revenue: r.revenue, bookings: r.bookings })),
      bookingsByWeekday: bookingsByWeekday.map((r) => ({ day: r._id.d, category: r._id.c || "other", count: r.count })),
      revenueByCategory: byCategory.map((r) => ({ category: r._id || "other", revenue: r.revenue, count: r.count })),
      topCities: byCity.map((r) => ({ city: r._id ? titleCase(r._id) : "Unknown", bookings: r.bookings, revenue: r.revenue })),
      bookingStatus: statusCounts.map((r) => ({ status: r._id || "unknown", count: r.count })),
      fleetMix: fleetByCategory.map((r) => ({ type: r._id || "Other", count: r.count })),
      userGrowth: userGrowth.map((r) => ({ year: r._id.y, month: r._id.m, users: r.users })),
      transactions: recent.map((b) => ({
        id: b.bookingRef,
        customer: b.user?.name || "—",
        vehicle: b.vehicle?.name || "—",
        city: b.vehicle?.city || b.pickupLocation || "—",
        amount: b.finalAmount,
        status: b.status,
        paymentStatus: b.paymentStatus,
        date: b.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin reports error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
