require("dotenv").config();
const mongoose = require("mongoose");
const { Review } = require("../models/Booking");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/wheelz";

const sampleReviews = [
  {
    title: "Excellent Service!",
    comment:
      "The bike was in pristine condition. The booking process was smooth and hassle-free. Highly recommend Wheelz!",
    rating: 5,
  },
  {
    title: "Great Experience",
    comment:
      "Very professional service. The car was clean and well-maintained. Will use again.",
    rating: 4,
  },
  {
    title: "Smooth Ride",
    comment:
      "Amazing experience with Wheelz. The vehicle was delivered on time and the return process was quick.",
    rating: 5,
  },
  {
    title: "Good Value for Money",
    comment:
      "Reasonable prices and good quality vehicles. Customer support was responsive.",
    rating: 4,
  },
  {
    title: "Highly Recommended!",
    comment:
      "Best rental service in town. The staff was friendly and helpful throughout the process.",
    rating: 5,
  },
];

const seedReviews = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing reviews
    await Review.deleteMany({});
    console.log("🗑️ Cleared existing reviews");

    // Get users and vehicles
    const users = await User.find({ role: "customer" });
    const vehicles = await Vehicle.find({ isActive: true });

    if (users.length === 0 || vehicles.length === 0) {
      console.log(
        "⚠️ No users or vehicles found. Please seed users and vehicles first.",
      );
      process.exit(0);
    }

    // Create reviews
    const reviews = [];
    for (let i = 0; i < sampleReviews.length; i++) {
      const review = {
        ...sampleReviews[i],
        user: users[i % users.length]._id,
        vehicle: vehicles[i % vehicles.length]._id,
        booking: new mongoose.Types.ObjectId(),
        isVerified: true,
        createdAt: new Date(Date.now() - i * 86400000), // Different dates
        updatedAt: new Date(),
      };
      reviews.push(review);
    }

    await Review.insertMany(reviews);
    console.log(`✅ Created ${reviews.length} sample reviews`);

    // Update vehicle ratings
    for (const vehicle of vehicles) {
      const vehicleReviews = await Review.find({ vehicle: vehicle._id });
      if (vehicleReviews.length > 0) {
        const avgRating =
          vehicleReviews.reduce((sum, r) => sum + r.rating, 0) /
          vehicleReviews.length;
        vehicle.averageRating = Math.round(avgRating * 10) / 10;
        vehicle.totalReviews = vehicleReviews.length;
        await vehicle.save();
      }
    }
    console.log("✅ Updated vehicle ratings");

    console.log("\n🎉 Review seeding complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding reviews:", error);
    process.exit(1);
  }
};

seedReviews();
