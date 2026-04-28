const { Booking } = require("../models/Booking");
const Review = require("../models/Review");
const Vehicle = require("../models/Vehicle");

// Create review (only for paid users)
exports.createReview = async (req, res) => {
  try {
    const { vehicleId, rating, title, comment } = req.body;
    const userId = req.user._id;

    console.log("Creating review:", {
      vehicleId,
      rating,
      title,
      comment,
      userId,
    });

    // Validation
    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID is required",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Review must be at least 5 characters long",
      });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Check if user has a paid/completed booking for this vehicle
    const hasPaidBooking = await Booking.findOne({
      user: userId,
      vehicle: vehicleId,
      paymentStatus: "paid",
      status: "confirmed",
    });

    if (!hasPaidBooking) {
      return res.status(403).json({
        success: false,
        message: "You can only review vehicles you have booked and paid for",
      });
    }

    // Check if user already reviewed this vehicle
    const existingReview = await Review.findOne({
      user: userId,
      vehicle: vehicleId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this vehicle",
      });
    }

    // Create review
    const review = await Review.create({
      user: userId,
      vehicle: vehicleId,
      booking: hasPaidBooking._id,
      rating: Number(rating),
      title: title || "",
      comment: comment.trim(),
      isVerified: true,
    });

    // Update vehicle average rating
    const stats = await Review.aggregate([
      { $match: { vehicle: vehicle._id } },
      {
        $group: {
          _id: "$vehicle",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Vehicle.findByIdAndUpdate(vehicle._id, {
        averageRating: parseFloat(stats[0].avgRating.toFixed(1)),
        totalReviews: stats[0].count,
      });
    }

    // Populate user details for response
    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name email",
    );

    res.status(201).json({
      success: true,
      review: populatedReview,
      message: "Review submitted successfully",
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit review",
    });
  }
};

// Get reviews for a vehicle
exports.getVehicleReviews = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const reviews = await Review.find({ vehicle: vehicleId })
      .populate("user", "name email")
      .sort("-createdAt");

    res.json({
      success: true,
      reviews: reviews || [],
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      reviews: [],
    });
  }
};

// Get featured reviews for homepage
exports.getFeaturedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isVerified: true })
      .populate("user", "name")
      .populate("vehicle", "name images")
      .sort("-createdAt")
      .limit(6);

    res.json({
      success: true,
      reviews: reviews || [],
    });
  } catch (error) {
    console.error("Get featured reviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      reviews: [],
    });
  }
};
