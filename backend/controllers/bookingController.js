/**
 * Booking Controller
 * Handles the full booking lifecycle with vendor-customer data sharing
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

    // Get vehicle with vendor details
    const vehicle = await Vehicle.findById(vehicleId).populate(
      "vendor",
      "name email phone vendorDetails businessDetails address",
    );

    if (!vehicle || !vehicle.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    if (!vehicle.isAvailableForDates(startDate, endDate)) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is not available for selected dates",
      });
    }

    const totalDays = calcDays(startDate, endDate);
    const pricePerDay = vehicle.calculateDynamicPrice();
    const extrasCostPerDay = calcExtrasCost(extras);
    const totalAmount = (pricePerDay + extrasCostPerDay) * totalDays;
    const finalAmount = totalAmount;

    // Get customer details
    const customer = await User.findById(req.user._id);

    // Prepare vendor details for booking
    const vendorData = vehicle.vendor
      ? {
          name: vehicle.vendor.name,
          businessName:
            vehicle.vendor.vendorDetails?.businessName || vehicle.vendor.name,
          phone: vehicle.vendor.phone,
          email: vehicle.vendor.email,
          address:
            vehicle.vendor.vendorDetails?.businessAddress ||
            vehicle.vendor.address?.street ||
            "",
          gstNumber: vehicle.vendor.vendorDetails?.gstNumber || "",
          pickupInstructions: `Please contact vendor at ${vehicle.vendor.phone} for pickup at ${pickupLocation || vehicle.locationName}`,
        }
      : {
          name: "Wheelz Admin",
          businessName: "Wheelz Rentals",
          phone: "9876543210",
          email: "support@wheelz.com",
          address: vehicle.locationName,
          pickupInstructions: `Please pickup at ${pickupLocation || vehicle.locationName}`,
        };

    // Prepare customer details for booking
    const customerData = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address:
        `${customer.address?.street || ""}, ${customer.address?.city || ""}, ${customer.address?.state || ""}`.replace(
          /^, |, $/g,
          "",
        ) || "Not provided",
    };

    // Create booking with vendor and customer details
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
      vendorDetails: vendorData,
      customerDetails: customerData,
    });

    const flags = await booking.checkFraud();
    await booking.save();

    // Mark vehicle as booked
    vehicle.bookedDates.push({ startDate, endDate, bookingId: booking._id });
    vehicle.totalBookings += 1;
    vehicle.popularityScore = Math.min(100, vehicle.popularityScore + 2);
    await vehicle.save();

    const populated = await Booking.findById(booking._id)
      .populate("vehicle", "name brand images basePrice")
      .populate("user", "name email phone");

    // Send confirmation email to customer with vendor details
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
          vendorName: vendorData.businessName,
          vendorPhone: vendorData.phone,
          vendorAddress: vendorData.address,
          pickupLocation: pickupLocation || vehicle.locationName,
          pickupInstructions: vendorData.pickupInstructions,
        },
      });
    } catch (emailErr) {
      console.warn("Booking email failed:", emailErr.message);
    }

    // Send notification email to vendor about new booking
    if (vehicle.vendor && vehicle.vendor.email) {
      try {
        await sendEmail({
          to: vehicle.vendor.email,
          subject: `New Booking Received - ${booking.bookingRef}`,
          template: "bookingConfirmation",
          data: {
            name: vehicle.vendor.name,
            bookingRef: booking.bookingRef,
            vehicleName: vehicle.name,
            startDate: new Date(startDate).toDateString(),
            endDate: new Date(endDate).toDateString(),
            totalDays,
            finalAmount,
            customerName: customerData.name,
            customerPhone: customerData.phone,
            customerEmail: customerData.email,
            customerAddress: customerData.address,
            pickupLocation: pickupLocation || vehicle.locationName,
          },
        });
      } catch (emailErr) {
        console.warn("Vendor notification email failed:", emailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      booking: populated,
      vendorDetails: vendorData,
      customerDetails: customerData,
      fraudFlags: flags.length > 0 ? flags : undefined,
      message: "Booking created successfully. Proceed to payment.",
    });
  } catch (err) {
    console.error("Create booking error:", err);
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

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

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
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (
      req.user.role !== "admin" &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (["completed", "cancelled"].includes(booking.status)) {
      return res.status(400).json({
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

// exports.processPayment = async (req, res, next) => {
//   try {
//     const booking = await Booking.findById(req.params.id).populate("vehicle");
//     if (!booking) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Booking not found" });
//     }

//     if (
//       req.user.role !== "admin" &&
//       booking.user.toString() !== req.user._id.toString()
//     ) {
//       return res
//         .status(403)
//         .json({ success: false, message: "Not authorized" });
//     }

//     booking.paymentStatus = "paid";
//     booking.paymentMethod = req.body.method || "mock";
//     booking.paidAt = new Date();
//     booking.status = "confirmed";
//     await booking.save();

//     // Send vendor details email after payment success
//     try {
//       await sendEmail({
//         to: req.user.email,
//         subject: `Payment Successful - ${booking.bookingRef}`,
//         template: "paymentSuccess",
//         data: {
//           name: req.user.name,
//           bookingRef: booking.bookingRef,
//           vehicleName: booking.vehicle?.name,
//           startDate: new Date(booking.startDate).toDateString(),
//           endDate: new Date(booking.endDate).toDateString(),
//           totalAmount: booking.finalAmount,
//           vendorName: booking.vendorDetails?.businessName,
//           vendorPhone: booking.vendorDetails?.phone,
//           vendorAddress: booking.vendorDetails?.address,
//           pickupLocation: booking.pickupLocation,
//         },
//       });
//     } catch (emailErr) {
//       console.warn("Payment success email failed:", emailErr.message);
//     }

//     res.json({
//       success: true,
//       message: "Payment processed successfully",
//       booking,
//       vendorDetails: booking.vendorDetails,
//       customerDetails: booking.customerDetails,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

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
exports.processPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("vehicle");
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

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

    // Get customer and vendor details
    const customer = await User.findById(booking.user);
    const vendor = await User.findById(booking.vehicle.vendor);

    // Send email to customer with vendor details
    try {
      await sendEmail({
        to: customer.email,
        subject: `Payment Successful - ${booking.bookingRef}`,
        template: "paymentSuccess",
        data: {
          name: customer.name,
          bookingRef: booking.bookingRef,
          vehicleName: booking.vehicle.name,
          startDate: new Date(booking.startDate).toDateString(),
          endDate: new Date(booking.endDate).toDateString(),
          totalAmount: booking.finalAmount,
          vendorName:
            vendor?.vendorDetails?.businessName || vendor?.name || "Wheelz",
          vendorPhone: vendor?.phone || "9876543210",
          vendorAddress:
            booking.vendorDetails?.address || booking.pickupLocation,
          pickupLocation: booking.pickupLocation,
        },
      });
      console.log(`✅ Payment success email sent to ${customer.email}`);
    } catch (emailErr) {
      console.error("Payment success email failed:", emailErr.message);
    }

    // Send email to vendor about booking confirmation
    if (vendor && vendor.email) {
      try {
        await sendEmail({
          to: vendor.email,
          subject: `Booking Confirmed - ${booking.bookingRef}`,
          template: "newBookingForVendor",
          data: {
            vendorName: vendor.vendorDetails?.businessName || vendor.name,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerEmail: customer.email,
            customerAddress: booking.customerDetails?.address || "Not provided",
            vehicleName: booking.vehicle.name,
            startDate: new Date(booking.startDate).toDateString(),
            endDate: new Date(booking.endDate).toDateString(),
            totalDays: booking.totalDays,
            totalAmount: booking.finalAmount,
            pickupLocation: booking.pickupLocation,
          },
        });
        console.log(
          `✅ Booking confirmation email sent to vendor ${vendor.email}`,
        );
      } catch (emailErr) {
        console.error("Vendor email failed:", emailErr.message);
      }
    }

    res.json({
      success: true,
      message: "Payment processed successfully",
      booking,
      vendorDetails: booking.vendorDetails,
      customerDetails: booking.customerDetails,
    });
  } catch (err) {
    next(err);
  }
};
