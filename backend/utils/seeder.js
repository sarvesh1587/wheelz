/**
 * Database Seeder
 * Run: node utils/seeder.js
 * Run with --destroy flag: node utils/seeder.js --destroy
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const { Booking } = require("../models/Booking");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/wheelz";

const users = [
  {
    name: "Admin User",
    email: "admin@wheelz.com",
    password: "admin123",
    role: "admin",
    phone: "9999999999",
    address: { city: "Mumbai", state: "Maharashtra", country: "India" },
  },
  {
    name: "Arjun Sharma",
    email: "arjun@example.com",
    password: "user1234",
    role: "customer",
    phone: "9876543210",
    address: { city: "Bangalore", state: "Karnataka", country: "India" },
    preferences: { vehicleType: "car", fuelType: "petrol", maxBudget: 2000 },
  },
  {
    name: "Priya Patel",
    email: "priya@example.com",
    password: "user1234",
    role: "customer",
    phone: "9876543211",
    address: { city: "Mumbai", state: "Maharashtra", country: "India" },
    preferences: { vehicleType: "bike", fuelType: "any", maxBudget: 500 },
  },
];

const getVehicles = (adminId) => [
  {
    name: "Maruti Swift Dzire",
    brand: "Maruti Suzuki",
    model: "Swift Dzire",
    year: 2023,
    category: "car",
    subCategory: "sedan",
    fuelType: "petrol",
    transmission: "manual",
    seatingCapacity: 5,
    basePrice: 1200,
    currentPrice: 1200,
    popularityScore: 85,
    images: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600",
    ],
    locationName: "MG Road, Bangalore",
    city: "Bangalore",
    location: { type: "Point", coordinates: [77.5946, 12.9716] },
    specifications: {
      mileage: "23 kmpl",
      engine: "1197cc",
      maxSpeed: "170 km/h",
      features: ["AC", "Power Steering", "Music System"],
    },
    addedBy: adminId,
    isAvailable: true,
    totalBookings: 45,
    averageRating: 4.5,
    totalReviews: 32,
  },
  {
    name: "Hyundai Creta",
    brand: "Hyundai",
    model: "Creta",
    year: 2023,
    category: "car",
    subCategory: "suv",
    fuelType: "diesel",
    transmission: "automatic",
    seatingCapacity: 5,
    basePrice: 2500,
    currentPrice: 2800,
    popularityScore: 92,
    images: [
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600",
    ],
    locationName: "Bandra West, Mumbai",
    city: "Mumbai",
    location: { type: "Point", coordinates: [72.8311, 19.0596] },
    specifications: {
      mileage: "17 kmpl",
      engine: "1497cc",
      maxSpeed: "185 km/h",
      features: ["AC", "GPS", "Sunroof", "Reverse Camera", "Cruise Control"],
    },
    addedBy: adminId,
    isAvailable: true,
    totalBookings: 78,
    averageRating: 4.7,
    totalReviews: 56,
  },
  {
    name: "Toyota Innova Crysta",
    brand: "Toyota",
    model: "Innova Crysta",
    year: 2022,
    category: "car",
    subCategory: "suv",
    fuelType: "diesel",
    transmission: "manual",
    seatingCapacity: 7,
    basePrice: 3200,
    currentPrice: 3500,
    popularityScore: 88,
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600",
    ],
    locationName: "Connaught Place, Delhi",
    city: "Delhi",
    location: { type: "Point", coordinates: [77.209, 28.6139] },
    specifications: {
      mileage: "14 kmpl",
      engine: "2393cc",
      maxSpeed: "175 km/h",
      features: ["AC", "Captain Seats", "7-Seater", "GPS", "Music System"],
    },
    addedBy: adminId,
    isAvailable: true,
    totalBookings: 62,
    averageRating: 4.6,
    totalReviews: 48,
  },
  {
    name: "Mercedes-Benz C-Class",
    brand: "Mercedes-Benz",
    model: "C-Class",
    year: 2023,
    category: "car",
    subCategory: "luxury",
    fuelType: "petrol",
    transmission: "automatic",
    seatingCapacity: 5,
    basePrice: 8000,
    currentPrice: 9000,
    popularityScore: 75,
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600",
    ],
    locationName: "Juhu, Mumbai",
    city: "Mumbai",
    location: { type: "Point", coordinates: [72.8302, 19.1028] },
    specifications: {
      mileage: "12 kmpl",
      engine: "1991cc",
      maxSpeed: "250 km/h",
      features: [
        "AC",
        "Leather Seats",
        "Panoramic Roof",
        "Burmester Audio",
        "MBUX",
        "Driver Assist",
      ],
    },
    addedBy: adminId,
    isAvailable: true,
    totalBookings: 25,
    averageRating: 4.9,
    totalReviews: 18,
  },
  {
    name: "Tata Nexon EV",
    brand: "Tata",
    model: "Nexon EV",
    year: 2024,
    category: "car",
    subCategory: "suv",
    fuelType: "electric",
    transmission: "automatic",
    seatingCapacity: 5,
    basePrice: 2200,
    currentPrice: 2200,
    popularityScore: 80,
    images: [
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600",
    ],
    locationName: "Koramangala, Bangalore",
    city: "Bangalore",
    location: { type: "Point", coordinates: [77.6245, 12.9352] },
    specifications: {
      mileage: "312 km range",
      engine: "Electric 30.2kWh",
      maxSpeed: "150 km/h",
      features: ["AC", "Fast Charging", "Connected Car", "Sunroof", "TPMS"],
    },
    addedBy: adminId,
    isAvailable: true,
    totalBookings: 38,
    averageRating: 4.4,
    totalReviews: 27,
  },
  {
    name: "Honda City",
    brand: "Honda",
    model: "City",
    year: 2023,
    category: "car",
    subCategory: "sedan",
    fuelType: "petrol",
    transmission: "automatic",
    seatingCapacity: 5,
    basePrice: 1800,
    currentPrice: 1800,
    popularityScore: 82,
    images: [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600",
    ],
    locationName: "Anna Nagar, Chennai",
    city: "Chennai",
    location: { type: "Point", coordinates: [80.2707, 13.0827] },
    specifications: {
      mileage: "17 kmpl",
      engine: "1498cc",
      maxSpeed: "180 km/h",
      features: [
        "AC",
        "Honda Sensing",
        "Lane Watch",
        "Sunroof",
        "Apple CarPlay",
      ],
    },
    addedBy: adminId,
    isAvailable: true,
    totalBookings: 51,
    averageRating: 4.5,
    totalReviews: 39,
  },
  {
    name: "Royal Enfield Classic 350",
    brand: "Royal Enfield",
    model: "Classic 350",
    year: 2023,
    category: "bike",
    subCategory: "cruiser",
    fuelType: "petrol",
    transmission: "manual",
    seatingCapacity: 2,
    basePrice: 800,
    currentPrice: 800,
    popularityScore: 90,
    images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600"],
    locationName: "Indiranagar, Bangalore",
    city: "Bangalore",
    location: { type: "Point", coordinates: [77.6409, 12.9784] },
    specifications: {
      mileage: "35 kmpl",
      engine: "349cc",
      maxSpeed: "130 km/h",
      features: ["Electric Start", "Disc Brakes", "ABS"],
    },
    addedBy: adminId,
    isAvailable: true,
    totalBookings: 95,
    averageRating: 4.8,
    totalReviews: 72,
  },
  {
    name: "Honda Activa 6G",
    brand: "Honda",
    model: "Activa 6G",
    year: 2023,
    category: "bike",
    subCategory: "scooter",
    fuelType: "petrol",
    transmission: "automatic",
    seatingCapacity: 2,
    basePrice: 350,
    currentPrice: 350,
    popularityScore: 88,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"],
    locationName: "Andheri, Mumbai",
    city: "Mumbai",
    location: { type: "Point", coordinates: [72.8479, 19.1136] },
    specifications: {
      mileage: "50 kmpl",
      engine: "109cc",
      maxSpeed: "90 km/h",
      features: ["Combi Brake", "USB Charging", "Digital Speedometer"],
    },
    addedBy: adminId,
    isAvailable: true,
    totalBookings: 110,
    averageRating: 4.3,
    totalReviews: 89,
  },
  {
    name: "KTM Duke 390",
    brand: "KTM",
    model: "Duke 390",
    year: 2023,
    category: "bike",
    subCategory: "sports",
    fuelType: "petrol",
    transmission: "manual",
    seatingCapacity: 2,
    basePrice: 1200,
    currentPrice: 1200,
    popularityScore: 85,
    images: [
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600",
    ],
    locationName: "Cyber City, Hyderabad",
    city: "Hyderabad",
    location: { type: "Point", coordinates: [78.4867, 17.385] },
    specifications: {
      mileage: "28 kmpl",
      engine: "373cc",
      maxSpeed: "167 km/h",
      features: [
        "Slipper Clutch",
        "TFT Display",
        "Ride Modes",
        "Quickshifter",
        "ABS",
      ],
    },
    addedBy: adminId,
    isAvailable: true,
    totalBookings: 58,
    averageRating: 4.7,
    totalReviews: 44,
  },
  {
    name: "Ather 450X",
    brand: "Ather",
    model: "450X",
    year: 2024,
    category: "bike",
    subCategory: "scooter",
    fuelType: "electric",
    transmission: "automatic",
    seatingCapacity: 2,
    basePrice: 450,
    currentPrice: 450,
    popularityScore: 78,
    images: [
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600",
    ],
    locationName: "Whitefield, Bangalore",
    city: "Bangalore",
    location: { type: "Point", coordinates: [77.748, 12.9698] },
    specifications: {
      mileage: "146 km range",
      engine: "Electric 6kWh",
      maxSpeed: "90 km/h",
      features: [
        "Touchscreen",
        "OTA Updates",
        "Navigation",
        "Fast Charging",
        "Warp Mode",
      ],
    },
    addedBy: adminId,
    isAvailable: true,
    totalBookings: 42,
    averageRating: 4.5,
    totalReviews: 31,
  },
];

const seedDB = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  if (process.argv[2] === "--destroy") {
    await Promise.all([
      User.deleteMany(),
      Vehicle.deleteMany(),
      Booking.deleteMany(),
    ]);
    console.log("🗑️  All data destroyed");
    process.exit(0);
  }

  const createdUsers = await User.create(users);
  const adminUser = createdUsers.find((u) => u.role === "admin");
  console.log(`✅ Created ${createdUsers.length} users`);

  const vehicleData = getVehicles(adminUser._id);
  const createdVehicles = await Vehicle.create(vehicleData);
  console.log(`✅ Created ${createdVehicles.length} vehicles`);

  const customer = createdUsers.find((u) => u.email === "arjun@example.com");
  const carVehicles = createdVehicles.filter((v) => v.category === "car");
  await Booking.create({
    user: customer._id,
    vehicle: carVehicles[0]._id,
    startDate: new Date("2024-01-10"),
    endDate: new Date("2024-01-13"),
    pickupLocation: carVehicles[0].locationName,
    totalDays: 3,
    pricePerDay: carVehicles[0].basePrice,
    totalAmount: carVehicles[0].basePrice * 3,
    discount: 0,
    finalAmount: carVehicles[0].basePrice * 3,
    status: "completed",
    paymentStatus: "paid",
    paidAt: new Date("2024-01-10"),
  });
  console.log("✅ Created sample bookings");

  console.log("\n🎉 Seed complete!\n");
  console.log("Test accounts:");
  console.log("  Admin  → admin@wheelz.com   / admin123");
  console.log("  User 1 → arjun@example.com  / user1234");
  console.log("  User 2 → priya@example.com  / user1234\n");
  process.exit(0);
};

seedDB().catch((err) => {
  console.error(err);
  process.exit(1);
});
