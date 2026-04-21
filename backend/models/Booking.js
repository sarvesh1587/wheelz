/**
 * Booking Model + Review Model
 * Tracks rental bookings with payment and fraud signals
 */

const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    // Add these fields to BookingSchema
    vendorDetails: {
      name: String,
      businessName: String,
      phone: String,
      email: String,
      address: String,
      pickupInstructions: String,
    },
    customerDetails: {
      name: String,
      phone: String,
      email: String,
      address: String,
    },
    pickupLocation: { type: String, required: true },
    pickupTime: Date,
    dropoffLocation: String,

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String },

    totalDays: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "active", "completed", "cancelled"],
      default: "pending",
    },
    cancellationReason: String,
    cancelledAt: Date,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "mock"],
      default: "mock",
    },
    stripePaymentIntentId: String,
    paidAt: Date,

    fraudFlags: [String],
    isFlagged: { type: Boolean, default: false },
    reviewedByAdmin: { type: Boolean, default: false },

    extras: {
      insurance: { type: Boolean, default: false },
      gps: { type: Boolean, default: false },
      childSeat: { type: Boolean, default: false },
      driver: { type: Boolean, default: false },
    },

    notes: String,
    bookingRef: { type: String, unique: true },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

BookingSchema.pre("save", function (next) {
  if (!this.bookingRef) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.bookingRef = `WLZ-${date}-${rand}`;
  }
  next();
});

BookingSchema.methods.checkFraud = async function () {
  const User = require("./User");
  const flags = [];

  const user = await User.findById(this.user);
  if (user && user.cancellationCount >= 3) {
    flags.push("High cancellation rate (3+ cancellations)");
  }

  const recentBookings = await mongoose.model("Booking").countDocuments({
    user: this.user,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  if (recentBookings > 3) {
    flags.push("Multiple bookings within 24 hours");
  }

  if (this.totalDays > 30 && user && user.cancellationCount === 0) {
    flags.push("Unusually long first rental period");
  }

  if (new Date(this.startDate) < new Date(Date.now() - 60 * 60 * 1000)) {
    flags.push("Booking start date in the past");
  }

  if (flags.length > 0) {
    this.isFlagged = true;
    this.fraudFlags = flags;
    if (user) {
      user.fraudScore = Math.min(100, user.fraudScore + flags.length * 20);
      user.fraudReasons = [
        ...new Set([...(user.fraudReasons || []), ...flags]),
      ];
      if (user.fraudScore >= 70) user.flaggedForReview = true;
      await user.save();
    }
  }

  return flags;
};

const Booking = mongoose.model("Booking", BookingSchema);

// Review Schema
const ReviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 100 },
    comment: { type: String, maxlength: 1000 },
    images: [String],
    helpful: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true },
);

ReviewSchema.index({ vehicle: 1 });
ReviewSchema.index({ user: 1 });

ReviewSchema.post("save", async function () {
  const Vehicle = require("./Vehicle");
  const stats = await mongoose.model("Review").aggregate([
    { $match: { vehicle: this.vehicle } },
    {
      $group: {
        _id: "$vehicle",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await Vehicle.findByIdAndUpdate(this.vehicle, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

const Review = mongoose.model("Review", ReviewSchema);

module.exports = { Booking, Review };
