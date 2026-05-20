const Vehicle = require("../models/Vehicle");
const { Booking } = require("../models/Booking"); // ✅ CORRECT - Booking is a named export
const User = require("../models/User");

// Conversation context storage
const conversationContext = new Map();

// Helper: Get available vehicles
async function getAvailableVehicles(filters = {}) {
  const query = { isAvailable: true, isActive: true };

  if (filters.category && filters.category !== "any") {
    query.category = filters.category;
  }
  if (filters.city && filters.city !== "any") {
    query.city = new RegExp(filters.city, "i");
  }
  if (filters.maxPrice) {
    query.basePrice = { $lte: filters.maxPrice };
  }
  if (filters.fuelType && filters.fuelType !== "any") {
    query.fuelType = filters.fuelType;
  }

  const vehicles = await Vehicle.find(query).limit(10);
  return vehicles;
}

// Format vehicle list
function formatVehicleList(vehicles) {
  if (vehicles.length === 0) {
    return "🚗 No vehicles available. Try different preferences!";
  }

  let message = "🎯 Here are the available vehicles:\n\n";
  vehicles.forEach((v, i) => {
    message += `${i + 1}. **${v.name}** (${v.brand})\n`;
    message += `   📍 ${v.city} | ⛽ ${v.fuelType}\n`;
    message += `   💰 ₹${v.currentPrice || v.basePrice}/day\n`;
    message += `   ⭐ Rating: ${v.averageRating || 0}/5\n\n`;
  });
  message +=
    "Reply with the vehicle number to book, or type 'search' to search again.";
  return message;
}

// Extract requirements from message
function extractRequirements(message) {
  const lowerMsg = message.toLowerCase();
  const requirements = {
    category: null,
    city: null,
    budget: null,
    fuelType: null,
    days: null,
  };

  // Extract category
  if (lowerMsg.includes("car")) requirements.category = "car";
  else if (lowerMsg.includes("bike")) requirements.category = "bike";

  // Extract city
  const cities = [
    "mumbai",
    "delhi",
    "bangalore",
    "chennai",
    "kolkata",
    "hyderabad",
    "pune",
    "ahmedabad",
    "jaipur",
  ];
  for (const city of cities) {
    if (lowerMsg.includes(city)) {
      requirements.city = city;
      break;
    }
  }

  // Extract budget
  const budgetMatch = message.match(/\d{3,5}/);
  if (budgetMatch) {
    requirements.budget = parseInt(budgetMatch[0]);
  }

  // Extract fuel type
  if (lowerMsg.includes("petrol")) requirements.fuelType = "petrol";
  else if (lowerMsg.includes("diesel")) requirements.fuelType = "diesel";
  else if (lowerMsg.includes("electric")) requirements.fuelType = "electric";

  // Extract days
  const dayMatch = message.match(/(\d+)\s*days?/i);
  if (dayMatch) {
    requirements.days = parseInt(dayMatch[1]);
  }

  return requirements;
}

// Main chat handler
exports.chat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    // Get or create conversation context
    let context = conversationContext.get(sessionId || userId) || {
      step: "greeting",
      filters: {},
      selectedVehicle: null,
      bookingData: {},
    };

    const userMessage = message.toLowerCase().trim();
    let reply = "";
    let action = null;
    let data = null;

    console.log("Chatbot - Step:", context.step, "Message:", userMessage);

    // Handle different conversation steps
    if (context.step === "greeting") {
      reply = "👋 Welcome to Wheelz AI Assistant!\n\n";
      reply += "I can help you find and book vehicles.\n\n";
      reply += "🔍 Type 'search' to find a vehicle\n";
      reply += "📋 Type 'my bookings' to see your bookings\n";
      reply += "❓ Type 'help' for assistance";
      context.step = "main_menu";
    } else if (userMessage === "my bookings") {
      const bookings = await Booking.find({ user: userId })
        .populate("vehicle", "name brand")
        .sort("-createdAt")
        .limit(5);

      if (bookings.length === 0) {
        reply =
          "📋 You don't have any bookings yet. Type 'search' to find vehicles!";
      } else {
        reply = "📋 **Your Recent Bookings:**\n\n";
        bookings.forEach((b, i) => {
          reply += `${i + 1}. ${b.vehicle?.name || "Vehicle"}\n`;
          reply += `   Status: ${b.status} | Amount: ₹${b.finalAmount}\n`;
          reply += `   Dates: ${new Date(b.startDate).toLocaleDateString()} - ${new Date(b.endDate).toLocaleDateString()}\n\n`;
        });
        reply += "Type 'search' to find new vehicles!";
      }
      context.step = "main_menu";
    } else if (userMessage === "help") {
      reply = "📖 **How to use Wheelz AI Assistant**\n\n";
      reply += "1️⃣ Type 'search' to find vehicles\n";
      reply += "2️⃣ Or directly tell me what you need:\n";
      reply += "   • 'Show me cars in Mumbai'\n";
      reply += "   • 'Find bikes under ₹500'\n";
      reply += "   • 'I need a car for 3 days'\n\n";
      reply += "Type 'my bookings' to see your bookings.";
      context.step = "main_menu";
    } else if (userMessage === "search") {
      reply = "🔍 Let me help you find a vehicle!\n\n";
      reply += "Tell me what you're looking for:\n";
      reply += "• City (Mumbai, Delhi, Bangalore)\n";
      reply += "• Budget per day\n";
      reply += "• Vehicle type (car/bike)\n\n";
      reply += "Example: 'Show me cars in Mumbai under ₹1500'";
      context.step = "collecting_requirements";
      context.filters = {};
    } else if (userMessage === "search again") {
      reply =
        "🔍 Let's start over!\n\nTell me what you're looking for (e.g., 'car in Mumbai under ₹1500')";
      context.step = "collecting_requirements";
      context.filters = {};
      context.selectedVehicle = null;
      context.bookingData = {};
    } else if (
      context.step === "main_menu" &&
      userMessage !== "my bookings" &&
      userMessage !== "help" &&
      userMessage !== "search"
    ) {
      // User gave a direct query, extract requirements
      const requirements = extractRequirements(message);

      context.filters = {
        category: requirements.category,
        city: requirements.city,
        maxPrice: requirements.budget,
        fuelType: requirements.fuelType,
      };

      if (requirements.days) {
        context.bookingData.days = requirements.days;
      }

      const vehicles = await getAvailableVehicles(context.filters);
      context.vehicles = vehicles;

      if (vehicles.length === 0) {
        reply = "😅 No vehicles found matching your criteria.\n\n";
        reply += "Let me show you all available vehicles:\n\n";
        const allVehicles = await getAvailableVehicles({});
        context.vehicles = allVehicles;
        reply += formatVehicleList(allVehicles);
      } else {
        reply = formatVehicleList(vehicles);
      }
      context.step = "selecting_vehicle";
    } else if (context.step === "collecting_requirements") {
      const requirements = extractRequirements(message);

      if (requirements.city) context.filters.city = requirements.city;
      if (requirements.category)
        context.filters.category = requirements.category;
      if (requirements.budget) context.filters.maxPrice = requirements.budget;
      if (requirements.fuelType)
        context.filters.fuelType = requirements.fuelType;
      if (requirements.days) context.bookingData.days = requirements.days;

      const vehicles = await getAvailableVehicles(context.filters);
      context.vehicles = vehicles;

      if (vehicles.length === 0) {
        reply =
          "😅 No vehicles found. Let me show you all available options:\n\n";
        const allVehicles = await getAvailableVehicles({});
        context.vehicles = allVehicles;
        reply += formatVehicleList(allVehicles);
      } else {
        reply = formatVehicleList(vehicles);
      }
      context.step = "selecting_vehicle";
    } else if (context.step === "selecting_vehicle") {
      const vehicleNum = parseInt(userMessage);

      if (
        !isNaN(vehicleNum) &&
        vehicleNum >= 1 &&
        vehicleNum <= context.vehicles?.length
      ) {
        context.selectedVehicle = context.vehicles[vehicleNum - 1];

        reply = `✅ You selected **${context.selectedVehicle.name}**!\n\n`;
        reply += `📋 **Details:**\n`;
        reply += `🚗 ${context.selectedVehicle.brand} • ${context.selectedVehicle.year}\n`;
        reply += `📍 ${context.selectedVehicle.city}\n`;
        reply += `💰 ₹${context.selectedVehicle.currentPrice || context.selectedVehicle.basePrice}/day\n`;
        reply += `⭐ Rating: ${context.selectedVehicle.averageRating || 0}/5\n\n`;

        if (context.bookingData.days) {
          const total =
            (context.selectedVehicle.currentPrice ||
              context.selectedVehicle.basePrice) * context.bookingData.days;
          reply += `📅 Duration: ${context.bookingData.days} days\n`;
          reply += `💰 Total: ₹${total}\n\n`;
          reply += `Confirm booking? (yes/no)`;
          context.bookingData.totalAmount = total;
          context.step = "confirm_booking";
        } else {
          reply += `How many days do you want to rent this vehicle? (1-30)`;
          context.step = "asking_days";
        }
      } else if (userMessage === "search") {
        reply = "🔍 Tell me what you're looking for (e.g., 'car in Mumbai')";
        context.step = "collecting_requirements";
      } else {
        reply =
          "Please enter the vehicle number from the list, or type 'search' to start over.";
      }
    } else if (context.step === "asking_days") {
      const days = parseInt(userMessage);

      if (!isNaN(days) && days > 0 && days <= 30) {
        context.bookingData.days = days;
        const price =
          context.selectedVehicle.currentPrice ||
          context.selectedVehicle.basePrice;
        const total = price * days;

        reply = `✅ ${days} day(s) rental\n`;
        reply += `💰 Total amount: ₹${total}\n\n`;
        reply += `Confirm booking? (yes/no)`;
        context.bookingData.totalAmount = total;
        context.step = "confirm_booking";
      } else {
        reply = "Please enter a valid number of days (1-30)";
      }
    } else if (context.step === "confirm_booking") {
      if (userMessage === "yes") {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + context.bookingData.days);

        // ✅ CORRECT - Booking.create is now a function
        // ✅ CORRECT - Send both totalAmount AND finalAmount
        const booking = await Booking.create({
          user: userId,
          vehicle: context.selectedVehicle._id,
          startDate,
          endDate,
          pickupLocation: context.selectedVehicle.city,
          totalDays: context.bookingData.days,
          pricePerDay:
            context.selectedVehicle.currentPrice ||
            context.selectedVehicle.basePrice,
          totalAmount: context.bookingData.totalAmount, // ✅ Required
          finalAmount: context.bookingData.totalAmount, // ✅ Required - both needed
          extras: context.bookingData.extras || {},
          status: "pending",
          paymentStatus: "pending",
        });

        context.booking = booking;

        reply = `✅ **Booking Created!**\n\n`;
        reply += `📝 Booking ID: ${booking._id}\n`;
        reply += `💰 Amount: ₹${context.bookingData.totalAmount}\n\n`;
        reply += `Click the button below to complete payment.`;

        action = "payment";
        data = {
          bookingId: booking._id,
          amount: context.bookingData.totalAmount,
        };
        context.step = "payment";
      } else if (userMessage === "no") {
        reply = "No problem! Type 'search' to find other vehicles.";
        context.step = "main_menu";
        context.selectedVehicle = null;
        context.bookingData = {};
      } else {
        reply = "Please reply with 'yes' to confirm or 'no' to cancel.";
      }
    } else {
      reply =
        "Type 'search' to find vehicles, 'my bookings' to see bookings, or 'help' for assistance.";
      context.step = "main_menu";
    }

    // Save context
    conversationContext.set(sessionId || userId, context);

    res.json({
      success: true,
      reply,
      action,
      data,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      reply: "😅 Sorry, I'm having trouble. Please try again.",
    });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("vehicle", "name brand images")
      .sort("-createdAt")
      .limit(5);

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
