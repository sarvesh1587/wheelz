const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    return "🚗 No vehicles available matching your criteria. Try different preferences!";
  }

  let message = "🎯 Here are the vehicles matching your requirements:\n\n";
  vehicles.forEach((v, i) => {
    message += `${i + 1}. **${v.name}** (${v.brand})\n`;
    message += `   📍 ${v.city} | ⛽ ${v.fuelType} | 🪑 ${v.seatingCapacity} seats\n`;
    message += `   💰 ₹${v.currentPrice || v.basePrice}/day\n`;
    message += `   ⭐ Rating: ${v.averageRating || 0}/5\n\n`;
  });
  message +=
    "Reply with the vehicle number to book, or type 'search' to search again.";
  return message;
}

// Extract requirements using Gemini AI
async function extractRequirements(message) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Extract vehicle rental requirements from this message: "${message}"
    
    Return ONLY a JSON object with these fields (use null if not mentioned):
    {
      "category": "car" or "bike" or null,
      "city": city name or null,
      "budget": number (max price per day) or null,
      "fuelType": "petrol" or "diesel" or "electric" or null,
      "days": number of days or null
    }
    
    Example: "I need a car in Mumbai for 3 days under 1500" -> {"category":"car","city":"Mumbai","budget":1500,"fuelType":null,"days":3}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      category: null,
      city: null,
      budget: null,
      fuelType: null,
      days: null,
    };
  } catch (error) {
    console.error("AI extraction error:", error);
    return {
      category: null,
      city: null,
      budget: null,
      fuelType: null,
      days: null,
    };
  }
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

    // Handle different conversation steps
    if (context.step === "greeting") {
      reply = "👋 Namaste! Welcome to Wheelz AI Assistant!\n\n";
      reply +=
        "I can help you find and book vehicles. What would you like to do?\n\n";
      reply +=
        "🔍 Tell me what you're looking for (e.g., 'car in Mumbai for 3 days under ₹1500')\n";
      reply += "📋 Type 'my bookings' to see your bookings\n";
      reply += "❓ Type 'help' for assistance";
      context.step = "main_menu";
    } else if (userMessage.includes("my bookings")) {
      const bookings = await Booking.find({ user: userId })
        .populate("vehicle", "name brand")
        .sort("-createdAt")
        .limit(5);

      if (bookings.length === 0) {
        reply =
          "📋 You don't have any bookings yet. Would you like to search for vehicles?";
      } else {
        reply = "📋 **Your Recent Bookings:**\n\n";
        bookings.forEach((b, i) => {
          reply += `${i + 1}. ${b.vehicle?.name || "Vehicle"} - ${b.status}\n`;
          reply += `   💰 ₹${b.finalAmount} | 📅 ${new Date(b.startDate).toLocaleDateString()}\n\n`;
        });
        reply += "Type 'search' to find new vehicles.";
      }
      context.step = "main_menu";
    } else if (userMessage === "help") {
      reply = "📖 **Help Guide**\n\n";
      reply += "• Describe what you need (e.g., 'car in Delhi for 2 days')\n";
      reply += "• Type 'my bookings' to see your bookings\n";
      reply += "• Type 'search' to start over\n\n";
      reply += "Example: 'Show me bikes in Bangalore under ₹800 for 5 days'";
      context.step = "main_menu";
    } else if (
      context.step === "main_menu" &&
      !userMessage.includes("my bookings") &&
      !userMessage.includes("help")
    ) {
      // Extract requirements using AI
      const requirements = await extractRequirements(message);

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
        reply = "😅 I couldn't find vehicles matching your criteria.\n\n";
        reply += "Let me show you all available options:\n\n";
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

        reply = `✅ Great choice! You selected **${context.selectedVehicle.name}**.\n\n`;
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
          reply += `How many days do you want to rent this vehicle?`;
          context.step = "asking_days";
        }
      } else if (userMessage === "search") {
        reply =
          "🔍 Tell me what you're looking for (e.g., 'car in Mumbai for 2 days')";
        context.step = "main_menu";
        context.filters = {};
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

        reply = `📅 ${days} day(s) rental\n`;
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
          finalAmount: context.bookingData.totalAmount,
          status: "pending",
          paymentStatus: "pending",
        });

        context.booking = booking;

        reply = `✅ **Booking Created Successfully!**\n\n`;
        reply += `📝 Booking ID: ${booking._id}\n`;
        reply += `💰 Amount to Pay: ₹${context.bookingData.totalAmount}\n\n`;
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
    } else if (context.step === "payment") {
      reply =
        "Complete payment using the button below to confirm your booking.";
      action = "payment";
      data = {
        bookingId: context.booking._id,
        amount: context.bookingData.totalAmount,
      };
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
