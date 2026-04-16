const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { Review, Booking } = require("../models/Booking");

router.get("/vehicle/:vehicleId", async (req, res) => {
  try {
    const reviews = await Review.find({ vehicle: req.params.vehicleId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { vehicleId, bookingId, rating, title, comment } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
      status: "completed",
    });
    if (!booking) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You can only review vehicles you have rented",
        });
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already reviewed this booking",
        });
    }

    const review = await Review.create({
      user: req.user._id,
      vehicle: vehicleId,
      booking: bookingId,
      rating,
      title,
      comment,
    });

    const populated = await Review.findById(review._id).populate(
      "user",
      "name avatar",
    );
    res.status(201).json({ success: true, review: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
