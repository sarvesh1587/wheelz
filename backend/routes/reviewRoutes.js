const express = require("express");
const router = express.Router();
const {
  createReview,
  getVehicleReviews,
  getFeaturedReviews,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

// Public routes
router.get("/vehicle/:vehicleId", getVehicleReviews);
router.get("/featured", getFeaturedReviews);

// Protected route (only logged-in users)
router.post("/", protect, createReview);

module.exports = router;
