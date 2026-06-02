/**
 * TripShare Controller
 * File: backend/controllers/tripShareController.js
 */

const { TripShare, TripRequest } = require("../models/TripShare");
const { Booking } = require("../models/Booking");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const sendEmail = require("../services/emailService");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Fuel cost estimate (reused from Trip Planner) ──────────────────────────
const CITY_DISTANCES = {
  "mumbai-pune": 150,
  "pune-mumbai": 150,
  "mumbai-goa": 590,
  "goa-mumbai": 590,
  "mumbai-nashik": 165,
  "nashik-mumbai": 165,
  "delhi-agra": 210,
  "agra-delhi": 210,
  "delhi-jaipur": 280,
  "jaipur-delhi": 280,
  "delhi-chandigarh": 250,
  "chandigarh-delhi": 250,
  "delhi-manali": 540,
  "manali-delhi": 540,
  "bangalore-mysore": 150,
  "mysore-bangalore": 150,
  "bangalore-ooty": 260,
  "ooty-bangalore": 260,
  "bangalore-goa": 560,
  "goa-bangalore": 560,
  "chennai-pondicherry": 160,
  "pondicherry-chennai": 160,
  "hyderabad-vijayawada": 275,
  "vijayawada-hyderabad": 275,
};

function estimateDistance(from, to) {
  const key = `${from.toLowerCase()}-${to.toLowerCase()}`;
  return CITY_DISTANCES[key] || 300;
}

function calculateFairSeatPrice(fromCity, toCity, seats, fuelType = "petrol") {
  const distance = estimateDistance(fromCity, toCity);
  const fuelRates = {
    petrol: 0.08,
    diesel: 0.06,
    electric: 0.015,
    hybrid: 0.06,
  };
  const rate = fuelRates[fuelType] || 0.08;
  const totalFuelCost = distance * rate * 100 * 2; // round trip
  const tollsEstimate = distance * 0.5;
  const totalCost = totalFuelCost + tollsEstimate;
  // Fair share — driver recovers cost, doesn't profit
  return Math.round(totalCost / (seats + 1)); // +1 for driver's share
}

// ─── CREATE TRIP ─────────────────────────────────────────────────────────────
exports.createTrip = async (req, res) => {
  try {
    const {
      bookingId,
      fromCity,
      toCity,
      fromAddress,
      toAddress,
      departureDate,
      departureTime,
      estimatedDuration,
      totalSeats,
      pricePerSeat,
      useAutoPrice,
      womenOnly,
      luggageAllowed,
      smokingAllowed,
      petsAllowed,
      acAvailable,
      instantBook,
      isRecurring,
      recurringDays,
      disclaimerAccepted,
    } = req.body;

    if (!disclaimerAccepted) {
      return res.status(400).json({
        success: false,
        message: "You must accept the disclaimer to offer a shared trip.",
      });
    }

    // Optionally link to a Wheelz booking
    let vehicle = null;
    let booking = null;
    let vehicleInfo = {};

    if (bookingId) {
      booking = await Booking.findById(bookingId).populate("vehicle");
      if (!booking)
        return res
          .status(404)
          .json({ success: false, message: "Booking not found" });
      if (booking.user.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ success: false, message: "Not your booking" });
      }
      vehicle = booking.vehicle;
      vehicleInfo = {
        name: vehicle.name,
        brand: vehicle.brand,
        category: vehicle.category,
        images: vehicle.images,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
      };
    }

    // Auto-calculate price if requested
    const finalPrice = useAutoPrice
      ? calculateFairSeatPrice(fromCity, toCity, totalSeats, vehicle?.fuelType)
      : parseInt(pricePerSeat);

    const distance = estimateDistance(fromCity, toCity);

    const trip = await TripShare.create({
      driver: req.user._id,
      booking: bookingId || null,
      vehicle: vehicle?._id || null,
      fromCity,
      toCity,
      fromAddress,
      toAddress,
      departureDate: new Date(departureDate),
      departureTime,
      estimatedDuration,
      totalSeats: parseInt(totalSeats),
      availableSeats: parseInt(totalSeats),
      pricePerSeat: finalPrice,
      autoCalculated: !!useAutoPrice,
      totalDistanceKm: distance,
      womenOnly: !!womenOnly,
      luggageAllowed: luggageAllowed || "medium",
      smokingAllowed: !!smokingAllowed,
      petsAllowed: !!petsAllowed,
      acAvailable: acAvailable !== false,
      instantBook: !!instantBook,
      isRecurring: !!isRecurring,
      recurringDays: recurringDays || [],
      vehicleInfo,
      disclaimerAccepted: true,
    });

    const populated = await TripShare.findById(trip._id).populate(
      "driver",
      "name avatar phone email",
    );

    res.status(201).json({
      success: true,
      trip: populated,
      message: "Trip listed successfully!",
    });
  } catch (err) {
    console.error("Create trip error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SEARCH TRIPS ────────────────────────────────────────────────────────────
exports.searchTrips = async (req, res) => {
  try {
    const { from, to, date, seats = 1, womenOnly } = req.query;

    if (!from || !to) {
      return res
        .status(400)
        .json({ success: false, message: "From and To cities are required" });
    }

    const query = {
      fromCity: new RegExp(from, "i"),
      toCity: new RegExp(to, "i"),
      status: "active",
      availableSeats: { $gte: parseInt(seats) },
    };

    if (date) {
      const d = new Date(date);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));
      query.departureDate = { $gte: dayStart, $lte: dayEnd };
    } else {
      query.departureDate = { $gte: new Date() };
    }

    if (womenOnly === "true") query.womenOnly = true;

    const trips = await TripShare.find(query)
      .populate("driver", "name avatar phone createdAt")
      .sort({ departureDate: 1 })
      .limit(20);

    // Enrich with driver stats
    const enriched = await Promise.all(
      trips.map(async (trip) => {
        const ridesCompleted = await TripRequest.countDocuments({
          trip: {
            $in: await TripShare.find({ driver: trip.driver._id }).distinct(
              "_id",
            ),
          },
          status: "completed",
        });
        const t = trip.toObject();
        t.driver.ridesCompleted = ridesCompleted;
        return t;
      }),
    );

    res.json({ success: true, trips: enriched, total: enriched.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET SINGLE TRIP ─────────────────────────────────────────────────────────
exports.getTrip = async (req, res) => {
  try {
    const trip = await TripShare.findById(req.params.id)
      .populate("driver", "name avatar phone email createdAt")
      .populate("vehicle", "name brand images");

    if (!trip)
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });

    // Get approved passengers (for driver view)
    const requests = await TripRequest.find({
      trip: trip._id,
      status: "approved",
    }).populate("passenger", "name avatar");

    res.json({ success: true, trip, approvedPassengers: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET MY TRIPS (as driver) ────────────────────────────────────────────────
exports.getMyTrips = async (req, res) => {
  try {
    const trips = await TripShare.find({ driver: req.user._id })
      .sort({ departureDate: -1 })
      .populate("vehicle", "name brand images");

    // Attach request counts
    const enriched = await Promise.all(
      trips.map(async (t) => {
        const pending = await TripRequest.countDocuments({
          trip: t._id,
          status: "pending",
        });
        const approved = await TripRequest.countDocuments({
          trip: t._id,
          status: "approved",
        });
        const obj = t.toObject();
        obj.pendingRequests = pending;
        obj.approvedPassengers = approved;
        return obj;
      }),
    );

    res.json({ success: true, trips: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET MY BOOKINGS (as passenger) ─────────────────────────────────────────
exports.getMyRides = async (req, res) => {
  try {
    const requests = await TripRequest.find({ passenger: req.user._id })
      .populate({
        path: "trip",
        populate: { path: "driver", select: "name avatar phone" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, rides: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── REQUEST SEAT ─────────────────────────────────────────────────────────────
exports.requestSeat = async (req, res) => {
  try {
    const { tripId, seatsRequested = 1, message } = req.body;

    const trip = await TripShare.findById(tripId).populate(
      "driver",
      "name email",
    );
    if (!trip)
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    if (trip.status !== "active")
      return res
        .status(400)
        .json({ success: false, message: "Trip is not available" });
    if (trip.driver._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot join your own trip" });
    }
    if (trip.availableSeats < seatsRequested) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough seats available" });
    }

    // Check if already requested
    const existing = await TripRequest.findOne({
      trip: tripId,
      passenger: req.user._id,
      status: { $in: ["pending", "approved"] },
    });
    if (existing)
      return res
        .status(400)
        .json({
          success: false,
          message: "You already have a request for this trip",
        });

    // Women-only check
    if (trip.womenOnly) {
      const passenger = await User.findById(req.user._id);
      if (passenger.gender !== "female") {
        return res
          .status(403)
          .json({ success: false, message: "This trip is women-only" });
      }
    }

    const totalAmount = trip.pricePerSeat * seatsRequested;

    const request = await TripRequest.create({
      trip: tripId,
      passenger: req.user._id,
      seatsRequested: parseInt(seatsRequested),
      message: message || "",
      totalAmount,
      status: trip.instantBook ? "approved" : "pending",
    });

    // If instant book, deduct seats immediately
    if (trip.instantBook) {
      trip.availableSeats -= seatsRequested;
      if (trip.availableSeats === 0) trip.status = "full";
      await trip.save();
    }

    // Notify driver
    try {
      await sendEmail({
        to: trip.driver.email,
        subject: `New seat request for your trip ${trip.tripRef}`,
        html: `<h2>New Seat Request</h2>
        <p><strong>${req.user.name}</strong> has requested ${seatsRequested} seat(s) on your trip from <strong>${trip.fromCity}</strong> to <strong>${trip.toCity}</strong> on ${new Date(trip.departureDate).toDateString()}.</p>
        <p>Message: ${message || "No message"}</p>
        <p>Log in to <a href="https://wheelz-sand.vercel.app">Wheelz</a> to approve or reject.</p>`,
      });
    } catch (e) {
      console.warn("Email failed:", e.message);
    }

    const populated = await TripRequest.findById(request._id)
      .populate("trip")
      .populate("passenger", "name avatar");

    res.status(201).json({
      success: true,
      request: populated,
      message: trip.instantBook
        ? "Seat booked instantly! Proceed to payment."
        : "Request sent! Driver will respond shortly.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── APPROVE / REJECT REQUEST ─────────────────────────────────────────────────
exports.respondToRequest = async (req, res) => {
  try {
    const { action } = req.body; // "approve" | "reject"
    const request = await TripRequest.findById(req.params.requestId)
      .populate("trip")
      .populate("passenger", "name email phone");

    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });

    const trip = request.trip;
    if (trip.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not your trip" });
    }
    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Request already processed" });
    }

    if (action === "approve") {
      if (trip.availableSeats < request.seatsRequested) {
        return res
          .status(400)
          .json({ success: false, message: "Not enough seats" });
      }

      request.status = "approved";
      request.contactShared = true;

      trip.availableSeats -= request.seatsRequested;
      if (trip.availableSeats === 0) trip.status = "full";
      await trip.save();

      // Notify passenger with contact info
      try {
        const driver = await User.findById(trip.driver).select(
          "name phone email",
        );
        await sendEmail({
          to: request.passenger.email,
          subject: `Your seat request was approved! 🎉`,
          html: `<h2>Seat Approved!</h2>
          <p>Great news! <strong>${driver.name}</strong> approved your seat request for the trip from <strong>${trip.fromCity}</strong> to <strong>${trip.toCity}</strong>.</p>
          <p><strong>Driver Contact:</strong> ${driver.phone}</p>
          <p><strong>Pickup:</strong> ${trip.fromAddress || trip.fromCity}</p>
          <p><strong>Departure:</strong> ${new Date(trip.departureDate).toDateString()} at ${trip.departureTime}</p>
          <p><strong>Total Amount:</strong> ₹${request.totalAmount}</p>
          <p>Please complete payment on <a href="https://wheelz-sand.vercel.app">Wheelz</a>.</p>`,
        });
      } catch (e) {
        console.warn("Email failed:", e.message);
      }
    } else if (action === "reject") {
      request.status = "rejected";

      try {
        await sendEmail({
          to: request.passenger.email,
          subject: `Seat request update for trip ${trip.tripRef}`,
          html: `<p>Unfortunately, the driver could not accommodate your request for the trip from ${trip.fromCity} to ${trip.toCity}. Please search for other trips.</p>`,
        });
      } catch (e) {
        console.warn("Email failed:", e.message);
      }
    }

    await request.save();

    res.json({
      success: true,
      request,
      message:
        action === "approve"
          ? "Request approved! Passenger notified."
          : "Request rejected.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PAYMENT — Create Razorpay order for seat payment ────────────────────────
exports.createPaymentOrder = async (req, res) => {
  try {
    const request = await TripRequest.findById(req.params.requestId);
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    if (request.passenger.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    if (request.status !== "approved") {
      return res
        .status(400)
        .json({ success: false, message: "Request not approved yet" });
    }

    const amountInPaise = Math.round(request.totalAmount * 100);
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `ts_${request._id.toString().slice(-10)}`,
      payment_capture: 1,
      notes: { requestId: request._id.toString() },
    });

    request.razorpayOrderId = order.id;
    await request.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PAYMENT — Verify and mark as paid (held in escrow) ──────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const { requestId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    const request = await TripRequest.findByIdAndUpdate(
      requestId,
      {
        paymentStatus: "held",
        razorpayPaymentId,
        paidAt: new Date(),
      },
      { new: true },
    ).populate("trip");

    res.json({
      success: true,
      message: "Payment held in escrow. Released after trip.",
      request,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── COMPLETE TRIP — driver marks trip done, releases payment ────────────────
exports.completeTrip = async (req, res) => {
  try {
    const trip = await TripShare.findById(req.params.tripId);
    if (!trip)
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    if (trip.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not your trip" });
    }

    trip.status = "completed";
    await trip.save();

    // Release all held payments
    await TripRequest.updateMany(
      { trip: trip._id, paymentStatus: "held" },
      { paymentStatus: "released", status: "completed" },
    );

    res.json({
      success: true,
      message: "Trip completed! Payments released to driver.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CANCEL TRIP (by driver) ──────────────────────────────────────────────────
exports.cancelTrip = async (req, res) => {
  try {
    const trip = await TripShare.findById(req.params.tripId);
    if (!trip)
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    if (
      trip.driver.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    trip.status = "cancelled";
    await trip.save();

    // Refund all paid requests
    await TripRequest.updateMany(
      { trip: trip._id, status: { $in: ["pending", "approved"] } },
      {
        status: "cancelled",
        paymentStatus: "refunded",
        cancelledBy: "driver",
        cancellationReason: req.body.reason || "Driver cancelled",
      },
    );

    res.json({
      success: true,
      message: "Trip cancelled. All passengers refunded.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SEND CHAT MESSAGE ────────────────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const request = await TripRequest.findById(req.params.requestId).populate(
      "trip",
      "driver",
    );

    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });

    const isDriver = request.trip.driver.toString() === req.user._id.toString();
    const isPassenger =
      request.passenger.toString() === req.user._id.toString();

    if (!isDriver && !isPassenger) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    if (request.status === "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Chat unlocks after approval" });
    }

    request.messages.push({
      sender: req.user._id,
      text,
      timestamp: new Date(),
    });
    await request.save();

    const msg = request.messages[request.messages.length - 1];
    res.json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET MESSAGES ─────────────────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    const request = await TripRequest.findById(req.params.requestId)
      .populate("messages.sender", "name avatar")
      .populate("trip", "driver");

    if (!request)
      return res.status(404).json({ success: false, message: "Not found" });

    const isDriver = request.trip.driver.toString() === req.user._id.toString();
    const isPassenger =
      request.passenger.toString() === req.user._id.toString();
    if (!isDriver && !isPassenger) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Mark messages as read
    request.messages.forEach((m) => {
      if (m.sender._id?.toString() !== req.user._id.toString()) m.read = true;
    });
    await request.save();

    res.json({ success: true, messages: request.messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RATE after trip ──────────────────────────────────────────────────────────
exports.rateUser = async (req, res) => {
  try {
    const { rating, review, rateWho } = req.body; // rateWho: "driver" | "passenger"
    const request = await TripRequest.findById(req.params.requestId).populate(
      "trip",
      "driver",
    );

    if (!request || request.status !== "completed") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Can only rate after trip completion",
        });
    }

    if (
      rateWho === "driver" &&
      request.passenger.toString() === req.user._id.toString()
    ) {
      request.driverRating = rating;
      request.driverReview = review;
      request.driverRatedByPassenger = true;
    } else if (
      rateWho === "passenger" &&
      request.trip.driver.toString() === req.user._id.toString()
    ) {
      request.passengerRating = rating;
      request.passengerReview = review;
      request.passengerRatedByDriver = true;
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to rate" });
    }

    await request.save();
    res.json({ success: true, message: "Rating submitted!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET DRIVER EARNINGS ──────────────────────────────────────────────────────
exports.getDriverEarnings = async (req, res) => {
  try {
    const trips = await TripShare.find({ driver: req.user._id }).distinct(
      "_id",
    );
    const released = await TripRequest.find({
      trip: { $in: trips },
      paymentStatus: "released",
    });

    const totalEarned = released.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalRides = released.length;

    const monthly = {};
    released.forEach((r) => {
      const key = new Date(r.paidAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthly[key] = (monthly[key] || 0) + r.totalAmount;
    });

    res.json({
      success: true,
      earnings: {
        totalEarned,
        totalRides,
        monthly: Object.entries(monthly).map(([month, amount]) => ({
          month,
          amount,
        })),
        pending: await TripRequest.aggregate([
          { $match: { trip: { $in: trips }, paymentStatus: "held" } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]).then((r) => r[0]?.total || 0),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
