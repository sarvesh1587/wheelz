const { Booking } = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const sendEmail = require("../services/emailService");

const calcDays = (start, end) =>
  Math.max(
    1,
    Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)),
  );
const calcExtrasCost = (extras = {}) => {
  let cost = 0;
  if (extras.insurance) cost += 200;
  if (extras.gps) cost += 100;
  if (extras.childSeat) cost += 150;
  if (extras.driver) cost += 500;
  return cost;
};

exports.createBooking = async (req, res) => {
  try {
    const {
      vehicleId,
      startDate,
      endDate,
      pickupLocation,
      extras,
      rentalType = "daily",
      hours,
    } = req.body;
    if (!vehicleId || !startDate || !pickupLocation)
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    if (rentalType === "daily" && !endDate)
      return res
        .status(400)
        .json({ success: false, message: "End date required" });

    const vehicle = await Vehicle.findById(vehicleId).populate(
      "vendor",
      "name email phone",
    );
    if (!vehicle)
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });

    const pricePerDay = vehicle.calculateDynamicPrice();
    const hourlyRate = Math.ceil(pricePerDay / 4);
    let totalDays, basePrice, extrasTotal, finalAmount;

    if (rentalType === "hourly") {
      totalDays = 1;
      basePrice = hourlyRate * parseInt(hours);
      extrasTotal = calcExtrasCost(extras);
    } else {
      totalDays = calcDays(startDate, endDate);
      basePrice = pricePerDay * totalDays;
      extrasTotal = calcExtrasCost(extras) * totalDays;
    }
    finalAmount = basePrice + extrasTotal;

    const booking = await Booking.create({
      user: req.user._id,
      vehicle: vehicleId,
      startDate: new Date(startDate),
      endDate: new Date(endDate || startDate),
      pickupLocation,
      totalDays,
      pricePerDay,
      totalAmount: finalAmount,
      finalAmount,
      extras: extras || {},
      rentalType,
      hours: rentalType === "hourly" ? parseInt(hours) : undefined,
      paymentStatus: "pending",
      status: "pending",
      customerDetails: {
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email,
      },
      vendorDetails: vehicle.vendor
        ? {
            name: vehicle.vendor.name,
            phone: vehicle.vendor.phone,
            email: vehicle.vendor.email,
          }
        : {},
    });

    // Booking confirmation email
    sendEmail({
      to: req.user.email,
      subject: `🚗 Booking Confirmed - ${booking.bookingRef}`,
      html: `<h1>Booking Confirmed!</h1><p>Vehicle: ${vehicle.name}</p><p>Dates: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate || startDate).toLocaleDateString()}</p><p>Amount: ₹${finalAmount.toLocaleString()}</p><p>Ref: ${booking.bookingRef}</p>`,
    }).catch((err) => console.log("Booking email failed:", err.message));

    res
      .status(201)
      .json({ success: true, booking, message: "Booking created!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookings = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const bookings = await Booking.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("vehicle", "name brand images");
  const total = await Booking.countDocuments({ user: req.user._id });
  res.json({ success: true, bookings, total });
};

exports.getBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("vehicle")
    .populate("user", "name email phone");
  if (!booking)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, booking });
};

exports.cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking)
    return res.status(404).json({ success: false, message: "Not found" });
  booking.status = "cancelled";
  booking.cancelledAt = new Date();
  await booking.save();
  res.json({ success: true, message: "Booking cancelled" });
};

exports.processPayment = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking)
    return res.status(404).json({ success: false, message: "Not found" });
  booking.paymentStatus = "paid";
  booking.status = "confirmed";
  booking.paidAt = new Date();
  await booking.save();

  sendEmail({
    to: req.user.email,
    subject: `💰 Payment Received - ${booking.bookingRef}`,
    html: `<h1>Payment Confirmed!</h1><p>Amount: ₹${booking.finalAmount.toLocaleString()}</p><p>Ref: ${booking.bookingRef}</p>`,
  }).catch(() => {});

  res.json({ success: true, message: "Payment processed", booking });
};

exports.getMyStats = async (req, res) => {
  const [total, active] = await Promise.all([
    Booking.countDocuments({ user: req.user._id }),
    Booking.countDocuments({
      user: req.user._id,
      status: { $in: ["confirmed", "active"] },
    }),
  ]);
  const spent = await Booking.aggregate([
    { $match: { user: req.user._id, paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$finalAmount" } } },
  ]);
  res.json({
    success: true,
    stats: {
      totalBookings: total,
      activeBookings: active,
      totalSpent: spent[0]?.total || 0,
    },
  });
};

exports.getVendorBookings = async (req, res) => {
  const vehicles = await Vehicle.find({ vendor: req.user._id });
  const bookings = await Booking.find({
    vehicle: { $in: vehicles.map((v) => v._id) },
  })
    .populate("vehicle", "name brand")
    .populate("user", "name email")
    .sort("-createdAt");
  res.json({ success: true, bookings });
};
