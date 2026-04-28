/**
 * Admin Controller
 * Dashboard analytics, user management, inventory overview
 */

const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const { Booking, Review } = require("../models/Booking");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsers,
      totalVehicles,
      availableVehicles,
      totalBookings,
      activeBookings,
      revenueAgg,
      recentBookings,
      monthlyRevenue,
      bookingsByStatus,
      topVehicles,
      fraudAlerts,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({
        role: "customer",
        createdAt: { $gte: thirtyDaysAgo },
      }),
      Vehicle.countDocuments({ isActive: true }),
      Vehicle.countDocuments({ isActive: true, isAvailable: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ["confirmed", "active"] } }),
      Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$finalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Booking.find({ createdAt: { $gte: sevenDaysAgo } })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "name email")
        .populate("vehicle", "name"),
      Booking.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: {
              $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            revenue: { $sum: "$finalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Vehicle.find({ isActive: true })
        .sort({ totalBookings: -1 })
        .limit(5)
        .select("name brand category totalBookings averageRating images"),
      Booking.countDocuments({ isFlagged: true, reviewedByAdmin: false }),
    ]);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, new: newUsers },
        vehicles: { total: totalVehicles, available: availableVehicles },
        bookings: { total: totalBookings, active: activeBookings },
        revenue: {
          total: revenueAgg[0]?.total || 0,
          totalPaid: revenueAgg[0]?.count || 0,
        },
        fraudAlerts,
      },
      charts: { monthlyRevenue, bookingsByStatus },
      recentBookings,
      topVehicles,
    });
  } catch (err) {
    next(err);
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = {};

    // ✅ Filter by role if provided
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select("-password");

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({
      success: true,
      user,
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRevenueBreakdown = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};
