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
const { sendEmail } = require("../services/emailService");

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
  const totalFuelCost = distance * rate * 100 * 2;
  const tollsEstimate = distance * 0.5;
  const totalCost = totalFuelCost + tollsEstimate;
  return Math.round(totalCost / (seats + 1));
}

// ─── CREATE TRIP (Only for confirmed bookings) ───────────────────────────────
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
      return res
        .status(400)
        .json({
          success: false,
          message: "You must accept the disclaimer to offer a shared trip.",
        });
    }

    if (!bookingId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Booking ID is required. Please book a vehicle first.",
        });
    }

    // ✅ SECURITY CHECK: Verify booking exists, belongs to user, and is confirmed
    const booking = await Booking.findById(bookingId).populate("vehicle");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You can only offer trips for your own bookings",
        });
    }

    if (booking.status !== "confirmed" || booking.paymentStatus !== "paid") {
      return res.status(403).json({
        success: false,
        message:
          "You can only offer trips for confirmed and paid bookings. Please complete your booking first.",
      });
    }

    const existingTrip = await TripShare.findOne({
      booking: bookingId,
      status: { $in: ["active", "full"] },
    });

    if (existingTrip) {
      return res
        .status(400)
        .json({
          success: false,
          message: "This booking already has an active trip share",
        });
    }

    const vehicle = booking.vehicle;
    const vehicleInfo = {
      name: vehicle.name,
      brand: vehicle.brand,
      category: vehicle.category,
      images: vehicle.images,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
    };

    const finalPrice = useAutoPrice
      ? calculateFairSeatPrice(fromCity, toCity, totalSeats, vehicle?.fuelType)
      : parseInt(pricePerSeat);

    const distance = estimateDistance(fromCity, toCity);

    const trip = await TripShare.create({
      driver: req.user._id,
      booking: bookingId,
      vehicle: vehicle._id,
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
    res
      .status(201)
      .json({
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
      query.departureDate = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    } else {
      query.departureDate = { $gte: new Date() };
    }
    if (womenOnly === "true") query.womenOnly = true;

    const trips = await TripShare.find(query)
      .populate("driver", "name avatar phone createdAt")
      .sort({ departureDate: 1 })
      .limit(20);
    res.json({ success: true, trips, total: trips.length });
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
        return {
          ...t.toObject(),
          pendingRequests: pending,
          approvedPassengers: approved,
        };
      }),
    );
    res.json({ success: true, trips: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET MY RIDES (as passenger) ─────────────────────────────────────────────
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

    if (trip.instantBook) {
      trip.availableSeats -= seatsRequested;
      if (trip.availableSeats === 0) trip.status = "full";
      await trip.save();
    }

    try {
      await sendEmail({
        to: trip.driver.email,
        subject: `New seat request for your trip`,
        html: `<h2>New Seat Request</h2><p><strong>${req.user.name}</strong> has requested ${seatsRequested} seat(s) on your trip from <strong>${trip.fromCity}</strong> to <strong>${trip.toCity}</strong>.</p>`,
      });
    } catch (e) {
      console.warn("Email failed:", e.message);
    }

    const populated = await TripRequest.findById(request._id)
      .populate("trip")
      .populate("passenger", "name avatar");
    res
      .status(201)
      .json({
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

// ─── GET DRIVER REQUESTS ─────────────────────────────────────────────────────
exports.getDriverRequests = async (req, res) => {
  try {
    const trips = await TripShare.find({ driver: req.user.id });
    const tripIds = trips.map((t) => t._id);
    const requests = await TripRequest.find({
      trip: { $in: tripIds },
      status: "pending",
    })
      .populate("passenger", "name email phone")
      .populate(
        "trip",
        "fromCity toCity departureDate availableSeats pricePerSeat",
      );
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── APPROVE / REJECT REQUEST ─────────────────────────────────────────────────
exports.respondToRequest = async (req, res) => {
  try {
    const { action } = req.body;
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
      await request.save();
    } else if (action === "reject") {
      request.status = "rejected";
      await request.save();
    }

    res.json({
      success: true,
      request,
      message: action === "approve" ? "Request approved!" : "Request rejected.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── COMPLETE TRIP ───────────────────────────────────────────────────────────
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

// ─── CANCEL TRIP ─────────────────────────────────────────────────────────────
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
