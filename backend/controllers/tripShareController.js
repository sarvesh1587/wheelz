/**
 * TripShare Controller - COMPLETE
 * File: backend/controllers/tripShareController.js
 */

const { TripShare, TripRequest } = require("../models/TripShare");
const { Booking } = require("../models/Booking");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
  const fuelCost = distance * 0.08 * 100 * 2;
  const tolls = distance * 0.5;
  return Math.round((fuelCost + tolls) / (parseInt(seats) + 1));
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
      vehicleName,
      vehicleBrand,
      disclaimerAccepted,
    } = req.body;

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
      vehicleInfo = {
        name: vehicleName,
        brand: vehicleBrand || "",
      };
    }

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

    let query = {
      fromCity: { $regex: new RegExp(from.trim(), "i") },
      toCity: { $regex: new RegExp(to.trim(), "i") },
      status: "active",
      availableSeats: { $gte: parseInt(seats) },
    };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.departureDate = { $gte: startDate, $lte: endDate };
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.departureDate = { $gte: today };
    }

    if (womenOnly === "true") {
      query.womenOnly = true;
    }

    console.log("📝 MongoDB Query:", JSON.stringify(query, null, 2));

    const trips = await TripShare.find(query)
      .populate("driver", "name avatar phone email")
      .sort({ departureDate: 1 })
      .limit(50);

    console.log(`✅ Found ${trips.length} trips`);

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
        // Count BOTH approved AND paid passengers
        const approved = await TripRequest.countDocuments({
          trip: t._id,
          status: "approved",
          paymentStatus: "paid", // ← ADD THIS
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

// ─── GET DRIVER REQUESTS ─────────────────────────────────────────────────────
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
// ─── GET REQUESTS FOR A SPECIFIC TRIP ────────────────────────────────────────
exports.getTripRequests = async (req, res) => {
  try {
    const { tripId } = req.params;

    console.log("🔍 Fetching requests for trip:", tripId);
    console.log("👤 User ID:", req.user._id);

    const trip = await TripShare.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }

    const isDriver = trip.driver.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    // ✅ Allow if user is driver OR admin
    if (!isDriver && !isAdmin) {
      console.log("❌ Unauthorized - User is not the driver");
      return res.status(403).json({
        success: false,
        message: "Not authorized to view these requests",
      });
    }

    const requests = await TripRequest.find({ trip: tripId })
      .populate("passenger", "name email phone")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${requests.length} requests`);

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

    if (!tripId) {
      return res
        .status(400)
        .json({ success: false, message: "Trip ID is required" });
    }

    const trip = await TripShare.findById(tripId);
    if (!trip)
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });

    if (trip.status !== "active") {
      return res
        .status(400)
        .json({ success: false, message: "Trip is not available for booking" });
    }

    if (trip.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot request a seat on your own trip",
      });
    }

    if (trip.availableSeats < seatsRequested) {
      return res.status(400).json({
        success: false,
        message: `Only ${trip.availableSeats} seat(s) available`,
      });
    }

    const existingRequest = await TripRequest.findOne({
      trip: tripId,
      passenger: req.user._id,
      status: { $in: ["pending", "approved"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${existingRequest.status} request for this trip`,
      });
    }

    const totalAmount = trip.pricePerSeat * seatsRequested;

    const request = await TripRequest.create({
      trip: tripId,
      passenger: req.user._id,
      seatsRequested: parseInt(seatsRequested),
      message: message || "",
      totalAmount,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      request,
      message: "Request sent to driver successfully!",
    });
  } catch (err) {
    console.error("Request seat error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RESPOND TO REQUEST ──────────────────────────────────────────────────────
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
      // Don't deduct seats here - deduct after payment
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

// ─── CANCEL REQUEST (Passenger) ──────────────────────────────────────────────
exports.cancelRequest = async (req, res) => {
  try {
    const request = await TripRequest.findById(req.params.requestId);

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    if (
      request.passenger.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (["cancelled", "completed", "rejected"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    // If request was approved, restore seats
    if (request.status === "approved") {
      const trip = await TripShare.findById(request.trip);
      if (trip) {
        trip.availableSeats += request.seatsRequested;
        if (trip.status === "full") trip.status = "active";
        await trip.save();
      }
    }

    request.status = "cancelled";
    request.cancelledBy = "passenger";
    request.cancelledAt = new Date();
    request.cancellationReason = req.body.reason || "Cancelled by passenger";
    await request.save();

    res.json({ success: true, message: "Request cancelled successfully" });
  } catch (err) {
    console.error("Cancel request error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CREATE PAYMENT ORDER ────────────────────────────────────────────────────
exports.createPaymentOrder = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await TripRequest.findById(requestId).populate("trip");
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

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

    if (request.paymentStatus === "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Payment already completed" });
    }

    const amountInPaise = Math.round(request.totalAmount * 100);

    console.log("💰 Creating Razorpay order:", {
      requestId,
      amountInRupees: request.totalAmount,
      amountInPaise,
    });

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `ride_${requestId.slice(-10)}_${Date.now().toString().slice(-8)}`,
      payment_capture: 1,
      notes: {
        requestId: requestId.toString(),
        type: "ride_share",
      },
    };

    const order = await razorpay.orders.create(options);

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
    console.error("Create payment order error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── VERIFY PAYMENT ──────────────────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const { requestId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const request = await TripRequest.findByIdAndUpdate(
      requestId,
      {
        paymentStatus: "paid",
        razorpayPaymentId,
        paidAt: new Date(),
      },
      { new: true },
    )
      .populate("trip")
      .populate("passenger", "name email phone");

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    // Now deduct seats after successful payment
    const trip = await TripShare.findById(request.trip._id);
    if (trip) {
      trip.availableSeats -= request.seatsRequested;
      if (trip.availableSeats <= 0) {
        trip.availableSeats = 0;
        trip.status = "full";
      }
      await trip.save();
    }

    res.json({
      success: true,
      message: "Payment verified! Trip confirmed.",
      request,
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SEND MESSAGE ────────────────────────────────────────────────────────────
// ─── SEND MESSAGE ────────────────────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message cannot be empty" });
    }

    const request = await TripRequest.findById(req.params.requestId);

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    // Initialize messages array if not exists
    if (!request.messages) {
      request.messages = [];
    }

    request.messages.push({
      sender: req.user._id,
      text: text.trim(),
      timestamp: new Date(),
      read: false,
    });

    await request.save();

    const msg = request.messages[request.messages.length - 1];

    res.json({ success: true, message: msg });
  } catch (err) {
    console.error("Send message error:", err);
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
      { trip: trip._id, status: "approved" },
      { status: "completed" },
    );

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

    await TripRequest.updateMany(
      { trip: trip._id, status: { $in: ["pending", "approved"] } },
      { status: "cancelled", cancelledBy: "driver" },
    );

    res.json({ success: true, message: "Trip cancelled" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RATE USER ───────────────────────────────────────────────────────────────
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

// ─── REPORT RIDE ─────────────────────────────────────────────────────────────
exports.reportRide = async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await TripRequest.findById(req.params.requestId)
      .populate("trip", "driver fromCity toCity")
      .populate("passenger", "name");

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    if (!reason || !reason.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Reason is required" });
    }

    // Log report for now - create a Report model later
    console.log("🚨 REPORT:", {
      requestId: request._id,
      reportedBy: req.user._id,
      reportedDriver: request.trip?.driver,
      trip: `${request.trip?.fromCity} → ${request.trip?.toCity}`,
      reason: reason.trim(),
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: "Report submitted. We will review this.",
    });
  } catch (err) {
    console.error("Report ride error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DRIVER EARNINGS ─────────────────────────────────────────────────────────
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
