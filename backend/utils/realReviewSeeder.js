require("dotenv").config();
const mongoose = require("mongoose");
const { Review } = require("../models/Booking");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/wheelz";

// Real sample reviews with different users
const sampleReviews = [
  {
    title: "Absolutely fantastic experience!",
    comment:
      "The car was spotless, pickup was seamless, and the staff was incredibly helpful. Best rental experience I've ever had! Will definitely use Wheelz again.",
    rating: 5,
  },
  {
    title: "Great value for money",
    comment:
      "Very reasonable prices and the bike was in excellent condition. The booking process was smooth and hassle-free.",
    rating: 4,
  },
  {
    title: "Outstanding service!",
    comment:
      "They went above and beyond to help me. The vehicle was delivered on time and the return process was super quick. Highly recommended!",
    rating: 5,
  },
  {
    title: "Good experience, would recommend",
    comment:
      "Everything went smoothly. The car was clean and well-maintained. Customer support was responsive.",
    rating: 4,
  },
  {
    title: "Perfect road trip companion",
    comment:
      "Took the SUV for a weekend trip. The vehicle performed flawlessly and the rental process was very professional.",
    rating: 5,
  },
  {
    title: "Decent experience",
    comment:
      "The bike was good but pickup location was a bit hard to find. Overall a decent experience.",
    rating: 3,
  },
  {
    title: "Excellent customer support",
    comment:
      "Had an issue with the booking, but the support team resolved it within minutes. Very impressed!",
    rating: 5,
  },
  {
    title: "Will use again",
    comment:
      "Simple and straightforward process. The vehicle was as described. No hidden charges.",
    rating: 4,
  },
];

// Different user data
const userProfiles = [
  {
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    phone: "9876543210",
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "9876543211",
  },
  { name: "Amit Patel", email: "amit.patel@email.com", phone: "9876543212" },
  { name: "Neha Singh", email: "neha.singh@email.com", phone: "9876543213" },
  {
    name: "Vikram Mehta",
    email: "vikram.mehta@email.com",
    phone: "9876543214",
  },
  { name: "Anjali Nair", email: "anjali.nair@email.com", phone: "9876543215" },
  { name: "Rahul Verma", email: "rahul.verma@email.com", phone: "9876543216" },
  { name: "Divya Reddy", email: "divya.reddy@email.com", phone: "9876543217" },
];

const seedRealReviews = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing reviews
    const deleted = await Review.deleteMany({});
    console.log(`🗑️ Deleted ${deleted.deletedCount} existing reviews`);

    // Get vehicles
    const vehicles = await Vehicle.find({ isActive: true });
    if (vehicles.length === 0) {
      console.log("⚠️ No vehicles found. Please seed vehicles first.");
      process.exit(0);
    }

    console.log(`Found ${vehicles.length} vehicles`);

    // Create or get users
    const createdReviews = [];

    for (let i = 0; i < sampleReviews.length; i++) {
      const userProfile = userProfiles[i % userProfiles.length];
      const vehicle = vehicles[i % vehicles.length];

      // Check if user exists, if not create one
      let user = await User.findOne({ email: userProfile.email });
      if (!user) {
        user = await User.create({
          name: userProfile.name,
          email: userProfile.email,
          password: "password123", // Default password
          phone: userProfile.phone,
          role: "customer",
          isActive: true,
        });
        console.log(`✅ Created user: ${user.name} (${user.email})`);
      }

      const review = {
        ...sampleReviews[i],
        user: user._id,
        vehicle: vehicle._id,
        booking: new mongoose.Types.ObjectId(),
        isVerified: true,
        createdAt: new Date(Date.now() - i * 86400000 * 3), // Spread over last 3 weeks
        updatedAt: new Date(),
      };
      createdReviews.push(review);
    }

    await Review.insertMany(createdReviews);
    console.log(`✅ Created ${createdReviews.length} real sample reviews`);

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

    // Display summary
    const ratingSummary = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    createdReviews.forEach((r) => ratingSummary[r.rating]++);

    console.log("\n📊 Review Summary:");
    console.log(`   Total Reviews: ${createdReviews.length}`);
    console.log(`   5★: ${ratingSummary[5]} reviews`);
    console.log(`   4★: ${ratingSummary[4]} reviews`);
    console.log(`   3★: ${ratingSummary[3]} reviews`);
    console.log(`   2★: ${ratingSummary[2]} reviews`);
    console.log(`   1★: ${ratingSummary[1]} reviews`);

    console.log("\n🎉 Real review seeding complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding reviews:", error);
    process.exit(1);
  }
};

seedRealReviews();
