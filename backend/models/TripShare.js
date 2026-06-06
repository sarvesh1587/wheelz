/**
 * TripShare & TripRequest Models
 * File: backend/models/TripShare.js
 */

const mongoose = require("mongoose");

// ─── TripShare — a driver offering seats on their trip ──────────────────────
const TripShareSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null, // ✅ Fixed: removed required:true — booking is optional
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },

    // Route
    fromCity: { type: String, required: true, trim: true },
    toCity: { type: String, required: true, trim: true },
    fromAddress: { type: String, trim: true },
    toAddress: { type: String, trim: true },

    // Schedule
    departureDate: { type: Date, required: true },
    departureTime: { type: String, required: true },
    estimatedDuration: { type: String },
    estimatedArrival: { type: String },

    // Seats
    totalSeats: { type: Number, required: true, min: 1, max: 4 },
    availableSeats: { type: Number, required: true, min: 0 },

    // Pricing
    pricePerSeat: { type: Number, required: true },
    autoCalculated: { type: Boolean, default: false },
    totalDistanceKm: { type: Number, default: 0 },

    // Preferences
    womenOnly: { type: Boolean, default: false },
    luggageAllowed: {
      type: String,
      enum: ["none", "small", "medium", "large"],
      default: "medium",
    },
    smokingAllowed: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },
    acAvailable: { type: Boolean, default: true },
    instantBook: { type: Boolean, default: false },

    // Vehicle info (denormalized for display)
    vehicleInfo: {
      name: String,
      brand: String,
      category: String,
      images: [String],
      fuelType: String,
      transmission: String,
    },

    // Status
    status: {
      type: String,
      enum: ["active", "full", "cancelled", "completed"],
      default: "active",
    },

    // Recurring trip
    isRecurring: { type: Boolean, default: false },
    recurringDays: [
      { type: String, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    ],

    // Insurance disclaimer accepted
    disclaimerAccepted: { type: Boolean, default: false },

    // Ratings summary
    driverRating: { type: Number, default: 0 },
    totalRidesDone: { type: Number, default: 0 },

    tripRef: { type: String, unique: true },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

// Auto-generate trip reference
TripShareSchema.pre("save", function (next) {
  if (!this.tripRef) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.tripRef = `TS-${date}-${rand}`;
  }
  next();
});

TripShareSchema.index({ fromCity: 1, toCity: 1, departureDate: 1 });
TripShareSchema.index({ driver: 1 });
TripShareSchema.index({ status: 1 });

// ─── TripRequest — a passenger requesting a seat ────────────────────────────
const TripRequestSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TripShare",
      required: true,
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seatsRequested: { type: Number, required: true, min: 1, max: 4 },
    message: { type: String, maxlength: 500 },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "completed"],
      default: "pending",
    },

    // Payment (escrow model)
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "held", "released", "refunded"],
      default: "pending",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    paidAt: { type: Date },

    // Contact sharing (only after approval)
    contactShared: { type: Boolean, default: false },

    // Chat messages (simple embedded chat)
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, maxlength: 1000 },
        timestamp: { type: Date, default: Date.now },
        read: { type: Boolean, default: false },
      },
    ],

    // Post-trip
    driverRatedByPassenger: { type: Boolean, default: false },
    passengerRatedByDriver: { type: Boolean, default: false },
    driverRating: { type: Number, min: 1, max: 5 },
    passengerRating: { type: Number, min: 1, max: 5 },
    driverReview: { type: String },
    passengerReview: { type: String },

    // Cancellation
    cancelledBy: { type: String, enum: ["driver", "passenger", "system"] },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },

    requestRef: { type: String, unique: true },
  },
  { timestamps: true },
);

TripRequestSchema.pre("save", function (next) {
  if (!this.requestRef) {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.requestRef = `TR-${rand}`;
  }
  next();
});

TripRequestSchema.index({ trip: 1 });
TripRequestSchema.index({ passenger: 1 });
TripRequestSchema.index({ status: 1 });

const TripShare = mongoose.model("TripShare", TripShareSchema);
const TripRequest = mongoose.model("TripRequest", TripRequestSchema);

module.exports = { TripShare, TripRequest };
