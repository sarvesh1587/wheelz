const { TripShare, TripRequest } = require("../models/TripShare");
const { Booking } = require("../models/Booking");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

// ─── Helper Functions ────────────────────────────────────────────────────────
const CITY_DISTANCES = {
  "mumbai-pune": 150,
  "pune-mumbai": 150,
  "mumbai-goa": 590,
  "goa-mumbai": 590,
  "delhi-agra": 210,
  "agra-delhi": 210,
  "delhi-jaipur": 280,
  "jaipur-delhi": 280,
  "bangalore-mysore": 150,
  "mysore-bangalore": 150,
  "bangalore-goa": 560,
  "goa-bangalore": 560,
  "chennai-pondicherry": 160,
  "pondicherry-chennai": 160,
};

function estimateDistance(from, to) {
  const key = `${from.toLowerCase()}-${to.toLowerCase()}`;
  return CITY_DISTANCES[key] || 300;
}

// ─── CREATE TRIP ─────────────────────────────────────────────────────────────
exports.createTrip = async (req, res) => {
  try {
    const {
      bookingId,
      fromCity,
      toCity,
      departureDate,
      departureTime,
      totalSeats,
      pricePerSeat,
      womenOnly,
      petsAllowed,
      luggageAllowed,
    } = req.body;

    if (!bookingId) {
      return res
        .status(400)
        .json({ success: false, message: "Booking ID required" });
    }

    const booking = await Booking.findById(bookingId).populate("vehicle");
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    if (booking.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not your booking" });
    }
    if (booking.status !== "confirmed" || booking.paymentStatus !== "paid") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Booking must be confirmed and paid",
        });
    }

    const existingTrip = await TripShare.findOne({
      booking: bookingId,
      status: "active",
    });
    if (existingTrip) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Active trip share already exists for this booking",
        });
    }

    const vehicle = booking.vehicle;
    const finalPrice =
      pricePerSeat ||
      Math.round((estimateDistance(fromCity, toCity) * 0.8) / totalSeats);

    const trip = await TripShare.create({
      driver: req.user._id,
      booking: bookingId,
      vehicle: vehicle._id,
      fromCity,
      toCity,
      departureDate: new Date(departureDate),
      departureTime,
      totalSeats: parseInt(totalSeats),
      availableSeats: parseInt(totalSeats),
      pricePerSeat: finalPrice,
      womenOnly: !!womenOnly,
      petsAllowed: !!petsAllowed,
      luggageAllowed: luggageAllowed || "medium",
      status: "active",
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
        .json({ success: false, message: "From and To cities required" });
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
      .populate("driver", "name avatar phone")
      .sort({ departureDate: 1 })
      .limit(20);
    res.json({ success: true, trips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET SINGLE TRIP ─────────────────────────────────────────────────────────
exports.getTrip = async (req, res) => {
  try {
    const trip = await TripShare.findById(req.params.id).populate(
      "driver",
      "name avatar phone email",
    );
    if (!trip)
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET MY TRIPS (Driver) ───────────────────────────────────────────────────
exports.getMyTrips = async (req, res) => {
  try {
    const trips = await TripShare.find({ driver: req.user._id }).sort({
      departureDate: -1,
    });
    const enriched = await Promise.all(
      trips.map(async (t) => {
        const pending = await TripRequest.countDocuments({
          trip: t._id,
          status: "pending",
        });
        return { ...t.toObject(), pendingRequests: pending };
      }),
    );
    res.json({ success: true, trips: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET MY RIDES (Passenger) ────────────────────────────────────────────────
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

// ─── GET DRIVER REQUESTS (All pending requests for driver) ───────────────────
exports.getDriverRequests = async (req, res) => {
  try {
    const trips = await TripShare.find({ driver: req.user.id });
    const tripIds = trips.map((t) => t._id);

    const requests = await TripRequest.find({
      trip: { $in: tripIds },
      status: "pending",
    })
      .populate("passenger", "name email phone")
      .populate("trip", "fromCity toCity departureDate pricePerSeat");

    res.json({ success: true, requests });
  } catch (err) {
    console.error("Get driver requests error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET REQUESTS FOR A SPECIFIC TRIP ────────────────────────────────────────
exports.getTripRequests = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await TripShare.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }

    if (trip.driver.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const requests = await TripRequest.find({ trip: tripId })
      .populate("passenger", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    console.error("Get trip requests error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── REQUEST SEAT ────────────────────────────────────────────────────────────
exports.requestSeat = async (req, res) => {
  try {
    const { tripId, seatsRequested = 1, message } = req.body;
    const trip = await TripShare.findById(tripId);
    if (!trip)
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    if (trip.status !== "active")
      return res
        .status(400)
        .json({ success: false, message: "Trip not available" });
    if (trip.driver._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot join your own trip" });
    }
    if (trip.availableSeats < seatsRequested) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough seats" });
    }

    const existing = await TripRequest.findOne({
      trip: tripId,
      passenger: req.user._id,
      status: { $in: ["pending", "approved"] },
    });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Request already exists" });

    const totalAmount = trip.pricePerSeat * seatsRequested;
    const request = await TripRequest.create({
      trip: tripId,
      passenger: req.user._id,
      seatsRequested,
      message: message || "",
      totalAmount,
      status: "pending",
    });

    res
      .status(201)
      .json({ success: true, request, message: "Request sent to driver!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RESPOND TO REQUEST (Approve/Reject) ─────────────────────────────────────
exports.respondToRequest = async (req, res) => {
  try {
    const { action } = req.body;
    const requestId = req.params.requestId;

    console.log("📝 Responding to request:", { requestId, action });

    const request = await TripRequest.findById(requestId).populate("trip");
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    const trip = request.trip;
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }

    if (trip.driver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
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
      trip.availableSeats -= request.seatsRequested;
      if (trip.availableSeats === 0) trip.status = "full";
      await trip.save();
      await request.save();
      console.log("✅ Request approved");
    } else if (action === "reject") {
      request.status = "rejected";
      await request.save();
      console.log("✅ Request rejected");
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });
    }

    res.json({
      success: true,
      request,
      message: action === "approve" ? "Request approved!" : "Request rejected",
    });
  } catch (err) {
    console.error("❌ Respond to request error:", err);
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
    res.json({ success: true, message: "Trip completed!" });
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
    res.json({ success: true, message: "Trip cancelled" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
