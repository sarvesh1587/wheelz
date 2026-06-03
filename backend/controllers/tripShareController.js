/**
 * TripShare Controller
 * File: backend/controllers/tripShareController.js
 */

const { TripShare, TripRequest } = require("../models/TripShare");
const { Booking } = require("../models/Booking");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

// ─── Helper: City distance map ───────────────────────────────────────────────
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

function calculateFairSeatPrice(fromCity, toCity, seats) {
  const distance = estimateDistance(fromCity, toCity);
  const fuelCost = distance * 0.08 * 100 * 2; // round trip
  const tolls = distance * 0.5;
  return Math.round((fuelCost + tolls) / (parseInt(seats) + 1));
}

// ─── CREATE TRIP ─────────────────────────────────────────────────────────────
exports.createTrip = async (req, res) => {
  try {
    const {
      bookingId, // ✅ optional
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
      vehicleName,
      vehicleBrand,
      disclaimerAccepted,
    } = req.body;

    // ✅ Basic validation
    if (
      !fromCity ||
      !toCity ||
      !departureDate ||
      !departureTime ||
      !totalSeats
    ) {
      return res.status(400).json({
        success: false,
        message:
          "From city, To city, departure date, time and seats are required",
      });
    }

    if (!disclaimerAccepted) {
      return res.status(400).json({
        success: false,
        message: "You must accept the disclaimer to offer a trip",
      });
    }

    // ✅ Optionally link to a Wheelz booking
    let vehicleId = null;
    let vehicleInfo = {};

    if (bookingId) {
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
      if (booking.vehicle) {
        vehicleId = booking.vehicle._id;
        vehicleInfo = {
          name: booking.vehicle.name,
          brand: booking.vehicle.brand,
          category: booking.vehicle.category,
          images: booking.vehicle.images || [],
          fuelType: booking.vehicle.fuelType,
          transmission: booking.vehicle.transmission,
        };
      }
    } else if (vehicleName) {
      // ✅ Driver manually enters vehicle info (no Wheelz booking)
      vehicleInfo = {
        name: vehicleName,
        brand: vehicleBrand || "",
      };
    }

    // ✅ Calculate price
    const distance = estimateDistance(fromCity, toCity);
    const finalPrice = useAutoPrice
      ? calculateFairSeatPrice(fromCity, toCity, totalSeats)
      : parseInt(pricePerSeat) ||
        calculateFairSeatPrice(fromCity, toCity, totalSeats);

    const trip = await TripShare.create({
      driver: req.user._id,
      booking: bookingId || null,
      vehicle: vehicleId,
      fromCity,
      toCity,
      fromAddress: fromAddress || "",
      toAddress: toAddress || "",
      departureDate: new Date(departureDate),
      departureTime,
      estimatedDuration: estimatedDuration || "",
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
      status: "active",
    });

    const populated = await TripShare.findById(trip._id).populate(
      "driver",
      "name avatar phone email",
    );

    console.log("✅ Trip created:", trip.tripRef);

    res.status(201).json({
      success: true,
      trip: populated,
      message: "Trip listed successfully!",
    });
  } catch (err) {
    console.error("❌ Create trip error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SEARCH TRIPS ────────────────────────────────────────────────────────────
// ─── SEARCH TRIPS - FIXED ────────────────────────────────────────────────────
exports.searchTrips = async (req, res) => {
  try {
    const { from, to, date, seats = 1, womenOnly } = req.query;

    console.log("🔍 SEARCH REQUEST:", { from, to, date, seats, womenOnly });

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "From and To cities required",
      });
    }

    // Build query
    let query = {
      fromCity: { $regex: new RegExp(from.trim(), "i") },
      toCity: { $regex: new RegExp(to.trim(), "i") },
      status: "active",
      availableSeats: { $gte: parseInt(seats) },
    };

    // ✅ FIXED: Date filter - match entire day regardless of time
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query.departureDate = {
        $gte: startDate,
        $lte: endDate,
      };
    } else {
      // No date provided - show upcoming trips from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.departureDate = { $gte: today };
    }

    // Women-only filter
    if (womenOnly === "true") {
      query.womenOnly = true;
    }

    console.log("📝 MongoDB Query:", JSON.stringify(query, null, 2));

    const trips = await TripShare.find(query)
      .populate("driver", "name avatar phone email")
      .sort({ departureDate: 1 })
      .limit(50);

    console.log(`✅ Found ${trips.length} trips`);

    // Log each trip for debugging
    trips.forEach((trip) => {
      console.log(
        `   - ${trip.fromCity} → ${trip.toCity}, Date: ${trip.departureDate}, Seats: ${trip.availableSeats}/${trip.totalSeats}`,
      );
    });

    res.json({
      success: true,
      trips,
      total: trips.length,
    });
  } catch (err) {
    console.error("Search trips error:", err);
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

// ─── GET DRIVER REQUESTS ──────────────────────────────────────────────────────
exports.getDriverRequests = async (req, res) => {
  try {
    const trips = await TripShare.find({ driver: req.user._id });
    const tripIds = trips.map((t) => t._id);

    const requests = await TripRequest.find({
      trip: { $in: tripIds },
      status: "pending",
    })
      .populate("passenger", "name email phone")
      .populate("trip", "fromCity toCity departureDate pricePerSeat");

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET REQUESTS FOR A SPECIFIC TRIP ────────────────────────────────────────
exports.getTripRequests = async (req, res) => {
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

    const requests = await TripRequest.find({ trip: req.params.tripId })
      .populate("passenger", "name email phone avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── REQUEST SEAT ────────────────────────────────────────────────────────────
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
        .json({ success: false, message: "Trip not available" });
    if (trip.driver._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot join your own trip" });
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
        .json({ success: false, message: "Request already exists" });

    const totalAmount = trip.pricePerSeat * parseInt(seatsRequested);
    const request = await TripRequest.create({
      trip: tripId,
      passenger: req.user._id,
      seatsRequested: parseInt(seatsRequested),
      message: message || "",
      totalAmount,
      status: trip.instantBook ? "approved" : "pending",
    });

    if (trip.instantBook) {
      trip.availableSeats -= parseInt(seatsRequested);
      if (trip.availableSeats === 0) trip.status = "full";
      await trip.save();
    }

    res.status(201).json({
      success: true,
      request,
      message: trip.instantBook
        ? "Seat booked instantly!"
        : "Request sent to driver!",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RESPOND TO REQUEST ───────────────────────────────────────────────────────
exports.respondToRequest = async (req, res) => {
  try {
    const { action } = req.body;
    const request = await TripRequest.findById(req.params.requestId).populate(
      "trip",
    );

    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });

    const trip = request.trip;
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
    } else if (action === "reject") {
      request.status = "rejected";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use approve or reject",
      });
    }

    await request.save();
    res.json({
      success: true,
      request,
      message: action === "approve" ? "Request approved!" : "Request rejected",
    });
  } catch (err) {
    console.error("Respond error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SEND MESSAGE ────────────────────────────────────────────────────────────
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

// ─── GET MESSAGES ────────────────────────────────────────────────────────────
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

    res.json({ success: true, messages: request.messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── COMPLETE TRIP ────────────────────────────────────────────────────────────
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
      { trip: trip._id, status: "approved" },
      { status: "completed" },
    );

    res.json({ success: true, message: "Trip completed!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CANCEL TRIP ──────────────────────────────────────────────────────────────
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
      { status: "cancelled", cancelledBy: "driver" },
    );

    res.json({ success: true, message: "Trip cancelled" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RATE USER ────────────────────────────────────────────────────────────────
exports.rateUser = async (req, res) => {
  try {
    const { rating, review, rateWho } = req.body;
    const request = await TripRequest.findById(req.params.requestId).populate(
      "trip",
      "driver",
    );

    if (!request || request.status !== "completed") {
      return res.status(400).json({
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

// ─── DRIVER EARNINGS ──────────────────────────────────────────────────────────
exports.getDriverEarnings = async (req, res) => {
  try {
    const trips = await TripShare.find({ driver: req.user._id }).distinct(
      "_id",
    );
    const completed = await TripRequest.find({
      trip: { $in: trips },
      status: "completed",
    });

    const totalEarned = completed.reduce(
      (sum, r) => sum + (r.totalAmount || 0),
      0,
    );

    res.json({
      success: true,
      earnings: {
        totalEarned,
        totalRides: completed.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
