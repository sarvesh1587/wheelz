/**
 * Booking Controller
 * Handles the full booking lifecycle
 */

const { Booking } = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const { sendEmail } = require("../services/emailService");

const calcDays = (start, end) => {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

const calcExtrasCost = (extras = {}) => {
  let cost = 0;
  if (extras.insurance) cost += 200;
  if (extras.gps) cost += 100;
  if (extras.childSeat) cost += 150;
  if (extras.driver) cost += 500;
  return cost;
};

exports.createBooking = async (req, res, next) => {
  try {
    const {
      vehicleId,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      extras,
      notes,
    } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || !vehicle.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    if (!vehicle.isAvailableForDates(startDate, endDate)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Vehicle is not available for selected dates",
        });
    }

    const totalDays = calcDays(startDate, endDate);
    const pricePerDay = vehicle.calculateDynamicPrice();
    const extrasCostPerDay = calcExtrasCost(extras);
    const totalAmount = (pricePerDay + extrasCostPerDay) * totalDays;
    const finalAmount = totalAmount;

    const booking = await Booking.create({
      user: req.user._id,
      vehicle: vehicleId,
      startDate,
      endDate,
      pickupLocation: pickupLocation || vehicle.locationName,
      dropoffLocation: dropoffLocation || vehicle.locationName,
      totalDays,
      pricePerDay,
      totalAmount,
      discount: 0,
      finalAmount,
      extras: extras || {},
      notes,
      paymentStatus: "pending",
      status: "pending",
    });

    const flags = await booking.checkFraud();
    await booking.save();

    vehicle.bookedDates.push({ startDate, endDate, bookingId: booking._id });
    vehicle.totalBookings += 1;
    vehicle.popularityScore = Math.min(100, vehicle.popularityScore + 2);
    await vehicle.save();

    const populated = await Booking.findById(booking._id)
      .populate("vehicle", "name brand images basePrice")
      .populate("user", "name email");

    try {
      await sendEmail({
        to: req.user.email,
        subject: `Booking Confirmed - ${booking.bookingRef}`,
        template: "bookingConfirmation",
        data: {
          name: req.user.name,
          bookingRef: booking.bookingRef,
          vehicleName: vehicle.name,
          startDate: new Date(startDate).toDateString(),
          endDate: new Date(endDate).toDateString(),
          totalDays,
          finalAmount,
        },
      });
    } catch (emailErr) {
      console.warn("Booking email failed:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      booking: populated,
      fraudFlags: flags.length > 0 ? flags : undefined,
      message: "Booking created successfully. Proceed to payment.",
    });
  } catch (err) {
    next(err);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = req.user.role === "admin" ? {} : { user: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("vehicle", "name brand images category city")
        .populate("user", "name email"),
      Booking.countDocuments(query),
    ]);

    res.json({
      success: true,
      bookings,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("vehicle")
      .populate("user", "name email phone");

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    if (
      req.user.role !== "admin" &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("vehicle");
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    if (
      req.user.role !== "admin" &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (["completed", "cancelled"].includes(booking.status)) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Cannot cancel a ${booking.status} booking`,
        });
    }

    booking.status = "cancelled";
    booking.cancellationReason = req.body.reason || "Cancelled by user";
    booking.cancelledAt = new Date();
    if (booking.paymentStatus === "paid") booking.paymentStatus = "refunded";
    await booking.save();

    const vehicle = booking.vehicle;
    vehicle.bookedDates = vehicle.bookedDates.filter(
      (d) => d.bookingId?.toString() !== booking._id.toString(),
    );
    await vehicle.save();

    await User.findByIdAndUpdate(booking.user, {
      $inc: { cancellationCount: 1 },
    });

    res.json({ success: true, message: "Booking cancelled", booking });
  } catch (err) {
    next(err);
  }
};

exports.processPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    if (
      req.user.role !== "admin" &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    booking.paymentStatus = "paid";
    booking.paymentMethod = req.body.method || "mock";
    booking.paidAt = new Date();
    booking.status = "confirmed";
    await booking.save();

    res.json({
      success: true,
      message: "Payment processed successfully",
      booking,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [total, active, completed, spent] = await Promise.all([
      Booking.countDocuments({ user: userId }),
      Booking.countDocuments({
        user: userId,
        status: { $in: ["confirmed", "active"] },
      }),
      Booking.countDocuments({ user: userId, status: "completed" }),
      Booking.aggregate([
        { $match: { user: userId, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$finalAmount" } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalBookings: total,
        activeBookings: active,
        completedBookings: completed,
        totalSpent: spent[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
