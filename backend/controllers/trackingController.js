/**
 * Live Tracking Controller
 * File: backend/controllers/trackingController.js
 */

const Location = require("../models/Location");
const { TripRequest } = require("../models/TripShare");

// ─── UPDATE DRIVER LOCATION ──────────────────────────────────────────────────

exports.updateLocation = async (req, res) => {
  try {
    const {
      requestId,
      latitude,
      longitude,
      speed,
      heading,
      batteryLevel,
      accuracy,
    } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ success: false, message: "Latitude and longitude required" });
    }

    const request = await TripRequest.findById(requestId).populate("trip");
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    // Verify driver owns this trip
    if (request.trip.driver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Only driver can update location" });
    }

    // Update or create location
    const location = await Location.findOneAndUpdate(
      { requestId },
      {
        tripId: request.trip._id,
        driver: req.user._id,
        latitude,
        longitude,
        speed: speed || 0,
        heading: heading || 0,
        batteryLevel,
        accuracy,
        $push: {
          route: {
            latitude,
            longitude,
            timestamp: new Date(),
          },
        },
        updatedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    res.json({ success: true, location });
  } catch (err) {
    console.error("Update location error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET DRIVER LOCATION ─────────────────────────────────────────────────────

exports.getLocation = async (req, res) => {
  try {
    const { requestId } = req.params;

    const location = await Location.findOne({ requestId });
    if (!location) {
      return res
        .status(404)
        .json({ success: false, message: "Location not available yet" });
    }

    res.json({ success: true, location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SET PICKUP/DROP POINTS ──────────────────────────────────────────────────

exports.setWaypoints = async (req, res) => {
  try {
    const { requestId, pickupLat, pickupLng, dropLat, dropLng } = req.body;

    const location = await Location.findOneAndUpdate(
      { requestId },
      { pickupLat, pickupLng, dropLat, dropLng },
      { upsert: true, new: true },
    );

    res.json({ success: true, location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STOP TRACKING ───────────────────────────────────────────────────────────

exports.stopTracking = async (req, res) => {
  try {
    const { requestId } = req.params;

    await Location.findOneAndUpdate({ requestId }, { isActive: false });

    res.json({ success: true, message: "Tracking stopped" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
