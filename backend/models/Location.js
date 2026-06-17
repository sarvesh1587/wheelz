/**
 * Driver Location Model
 * File: backend/models/Location.js
 */

const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TripRequest",
      required: true,
      unique: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TripShare",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Current position
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },

    // Route waypoints
    route: [
      {
        latitude: Number,
        longitude: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Trip info
    pickupLat: { type: Number },
    pickupLng: { type: Number },
    dropLat: { type: Number },
    dropLng: { type: Number },

    // Status
    isActive: { type: Boolean, default: true },
    speed: { type: Number, default: 0 }, // km/h
    heading: { type: Number, default: 0 }, // direction in degrees

    // Device info
    batteryLevel: { type: Number },
    accuracy: { type: Number }, // GPS accuracy in meters

    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

LocationSchema.index({ requestId: 1 });
LocationSchema.index({ tripId: 1 });

module.exports = mongoose.model("Location", LocationSchema);
