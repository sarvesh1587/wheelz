/**
 * Vehicle Model
 * Supports dynamic pricing and availability tracking
 */

const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    category: { type: String, required: true, enum: ["car", "bike"] },
    subCategory: { type: String, required: true },
    fuelType: {
      type: String,
      required: true,
      enum: ["petrol", "diesel", "electric", "hybrid"],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isApproved: {
      type: Boolean,
      default: true, // Changed to true so admin vehicles don't need approval
    },
    commissionRate: {
      type: Number,
      default: 10,
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic"],
      default: "manual",
    },
    seatingCapacity: { type: Number, default: 4 },
    images: [{ type: String }],

    // Pricing
    basePrice: { type: Number, required: true, min: 0 },
    currentPrice: {
      type: Number,
      default: function () {
        return this.basePrice;
      },
    },
    priceMultiplier: { type: Number, default: 1.0 },

    // Location
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    locationName: { type: String, required: true },
    city: { type: String, required: true },

    // Availability
    isAvailable: { type: Boolean, default: true },
    bookedDates: [
      {
        startDate: Date,
        endDate: Date,
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
      },
    ],

    // Specs - Made optional with default
    specifications: {
      type: Object,
      default: {
        mileage: "",
        engine: "",
        maxSpeed: "",
        features: [],
      },
    },

    // Ratings
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },

    // Analytics
    totalBookings: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0 },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

VehicleSchema.index({ location: "2dsphere" });
VehicleSchema.index({ category: 1, isAvailable: 1, city: 1 });
VehicleSchema.index({ basePrice: 1 });
VehicleSchema.index({ popularityScore: -1 });

VehicleSchema.methods.isAvailableForDates = function (startDate, endDate) {
  if (!this.isAvailable) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return !this.bookedDates.some(({ startDate: bs, endDate: be }) => {
    const bStart = new Date(bs);
    const bEnd = new Date(be);
    return start < bEnd && end > bStart;
  });
};

VehicleSchema.methods.calculateDynamicPrice = function () {
  let multiplier = 1.0;

  if (this.totalBookings > 100) multiplier += 0.3;
  else if (this.totalBookings > 50) multiplier += 0.15;

  if (this.popularityScore > 80) multiplier += 0.2;
  else if (this.popularityScore > 60) multiplier += 0.1;

  const bookedInNext30Days = this.bookedDates.filter((d) => {
    const daysFromNow =
      (new Date(d.startDate) - new Date()) / (1000 * 60 * 60 * 24);
    return daysFromNow >= 0 && daysFromNow <= 30;
  }).length;

  if (bookedInNext30Days > 20) multiplier += 0.25;
  else if (bookedInNext30Days > 10) multiplier += 0.1;

  this.priceMultiplier = Math.min(multiplier, 2.0);
  this.currentPrice = Math.round(this.basePrice * this.priceMultiplier);
  return this.currentPrice;
};

module.exports = mongoose.model("Vehicle", VehicleSchema);
