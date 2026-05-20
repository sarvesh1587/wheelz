const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Conversation context storage
const conversationContext = new Map();

// Helper: Get available vehicles based on filters
async function getAvailableVehicles(filters = {}) {
  const query = { isAvailable: true, isActive: true };

  if (filters.category) query.category = filters.category;
  if (filters.city) query.city = new RegExp(filters.city, "i");
  if (filters.minPrice)
    query.basePrice = { ...query.basePrice, $gte: filters.minPrice };
  if (filters.maxPrice)
    query.basePrice = { ...query.basePrice, $lte: filters.maxPrice };
  if (filters.fuelType) query.fuelType = filters.fuelType;

  const vehicles = await Vehicle.find(query).limit(10);
  return vehicles;
}

// Helper: Format vehicle list for display
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
    "Reply with the vehicle number to book, or type 'more' to see more options.";
  return message;
}

// Helper: Extract user intent and entities
function extractIntent(message) {
  const lowerMsg = message.toLowerCase();

  // Booking intent
  if (
    lowerMsg.includes("book") ||
    lowerMsg.includes("rent") ||
    lowerMsg.includes("want")
  ) {
    return "booking";
  }

  // Browse intent
  if (
    lowerMsg.includes("show") ||
    lowerMsg.includes("see") ||
    lowerMsg.includes("list") ||
    lowerMsg.includes("available")
  ) {
    return "browse";
  }

  // Help intent
  if (lowerMsg.includes("help") || lowerMsg.includes("how to")) {
    return "help";
  }

  // Cancel intent
  if (lowerMsg.includes("cancel")) {
    return "cancel";
  }

  // Check status
  if (lowerMsg.includes("status") || lowerMsg.includes("my booking")) {
    return "status";
  }

  return "general";
}

// Main chat handler
exports.chat = async (req, res) => {
  try {
    const { message, userId, sessionId } = req.body;

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
      lastMessage: "",
    };

    const userMessage = message.trim();
    const intent = extractIntent(userMessage);

    let reply = "";
    let action = null;
    let data = null;

    // Handle different intents and conversation steps
    if (context.step === "greeting") {
      reply = "👋 Namaste! Welcome to Wheelz AI Assistant!\n\n";
      reply += "I can help you:\n";
      reply += "🔍 Find the perfect car or bike for your needs\n";
      reply += "💰 Get best prices and deals\n";
      reply += "📅 Book instantly\n";
      reply += "💳 Complete payment securely\n\n";
      reply += "Tell me what you're looking for! For example:\n";
      reply += "• 'I need a car in Mumbai for 3 days'\n";
      reply += "• 'Show me bikes under ₹500 in Bangalore'\n";
      reply += "• 'Book an SUV for this weekend'";
      context.step = "collecting_requirements";
    } else if (context.step === "collecting_requirements") {
      // Extract requirements using AI
      const extractionPrompt = `
        Extract requirements from: "${userMessage}"
        Return JSON format: { "category": "car/bike", "city": "city name", "days": number, "budget": number, "fuelType": "petrol/diesel/electric" }
        If not specified, use null.
      `;

      // Use Gemini to extract requirements
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(extractionPrompt);
      const extracted = JSON.parse(result.response.text());

      context.filters = {
        category: extracted.category || null,
        city: extracted.city || null,
        minPrice: extracted.budget ? extracted.budget - 500 : null,
        maxPrice: extracted.budget || null,
        fuelType: extracted.fuelType || null,
      };

      context.bookingData.days = extracted.days || null;

      // Search for vehicles
      const vehicles = await getAvailableVehicles(context.filters);
      context.vehicles = vehicles;
      context.selectedVehicleIndex = null;

      if (vehicles.length === 0) {
        reply =
          "😅 I couldn't find any vehicles matching your criteria. Let me show you all available options:\n\n";
        const allVehicles = await getAvailableVehicles({});
        context.vehicles = allVehicles;
        reply += formatVehicleList(allVehicles);
        context.step = "selecting_vehicle";
      } else {
        reply = formatVehicleList(vehicles);
        context.step = "selecting_vehicle";
      }
    } else if (context.step === "selecting_vehicle") {
      // User selected a vehicle number
      const vehicleNum = parseInt(userMessage);

      if (
        !isNaN(vehicleNum) &&
        vehicleNum >= 1 &&
        vehicleNum <= context.vehicles.length
      ) {
        context.selectedVehicle = context.vehicles[vehicleNum - 1];
        context.selectedVehicleIndex = vehicleNum - 1;

        reply = `✅ Great choice! You selected **${context.selectedVehicle.name}**.\n\n`;
        reply += `📋 Details:\n`;
        reply += `🚗 ${context.selectedVehicle.brand} • ${context.selectedVehicle.year}\n`;
        reply += `📍 ${context.selectedVehicle.city}\n`;
        reply += `💰 ₹${context.selectedVehicle.currentPrice || context.selectedVehicle.basePrice}/day\n`;
        reply += `⭐ Rating: ${context.selectedVehicle.averageRating || 0}/5\n\n`;

        if (context.bookingData.days) {
          const total =
            (context.selectedVehicle.currentPrice ||
              context.selectedVehicle.basePrice) * context.bookingData.days;
          reply += `📅 Duration: ${context.bookingData.days} days\n`;
          reply += `💵 Estimated Total: ₹${total}\n\n`;
          reply += `Would you like to proceed with booking? (yes/no)`;
          context.step = "confirm_booking";
        } else {
          reply += `How many days do you want to rent this vehicle?`;
          context.step = "asking_days";
        }
      } else if (userMessage.toLowerCase() === "more") {
        const moreVehicles = await getAvailableVehicles({});
        reply = formatVehicleList(moreVehicles);
        context.vehicles = moreVehicles;
      } else {
        reply =
          "Please enter the vehicle number from the list above, or type 'more' to see more options.";
      }
    } else if (context.step === "asking_days") {
      const days = parseInt(userMessage);

      if (!isNaN(days) && days > 0) {
        context.bookingData.days = days;
        const total =
          (context.selectedVehicle.currentPrice ||
            context.selectedVehicle.basePrice) * days;

        reply = `📅 ${days} days rental\n`;
        reply += `💰 Total amount: ₹${total}\n\n`;
        reply += `Do you want to add any extras?\n`;
        reply += `• GPS Navigation (+₹100/day)\n`;
        reply += `• Zero Dep Insurance (+₹200/day)\n`;
        reply += `• Child Seat (+₹150/day)\n`;
        reply += `• Professional Driver (+₹500/day)\n\n`;
        reply += `Reply with the extras you want, or type 'no' to skip.`;
        context.step = "adding_extras";
      } else {
        reply = "Please enter a valid number of days (e.g., 3)";
      }
    } else if (context.step === "adding_extras") {
      const lowerMsg = userMessage.toLowerCase();
      const extras = {};

      if (lowerMsg.includes("gps")) extras.gps = true;
      if (lowerMsg.includes("insurance")) extras.insurance = true;
      if (lowerMsg.includes("child")) extras.childSeat = true;
      if (lowerMsg.includes("driver")) extras.driver = true;

      context.bookingData.extras = extras;

      let extrasCost = 0;
      if (extras.gps) extrasCost += 100;
      if (extras.insurance) extrasCost += 200;
      if (extras.childSeat) extrasCost += 150;
      if (extras.driver) extrasCost += 500;

      const vehiclePrice =
        context.selectedVehicle.currentPrice ||
        context.selectedVehicle.basePrice;
      const total = (vehiclePrice + extrasCost) * context.bookingData.days;

      reply = `📋 Booking Summary:\n`;
      reply += `🚗 Vehicle: ${context.selectedVehicle.name}\n`;
      reply += `📅 Days: ${context.bookingData.days}\n`;
      reply += `💰 Base Price: ₹${vehiclePrice * context.bookingData.days}\n`;
      if (extrasCost > 0)
        reply += `➕ Extras: +₹${extrasCost * context.bookingData.days}\n`;
      reply += `💵 Total Amount: ₹${total}\n\n`;
      reply += `Confirm your booking? (yes/no)`;
      context.step = "confirm_booking";
      context.bookingData.totalAmount = total;
    } else if (context.step === "confirm_booking") {
      if (userMessage.toLowerCase() === "yes") {
        // Create booking in database
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1); // Tomorrow
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + context.bookingData.days);

        const bookingData = {
          vehicleId: context.selectedVehicle._id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          pickupLocation: context.selectedVehicle.city,
          extras: context.bookingData.extras || {},
          totalDays: context.bookingData.days,
          totalAmount: context.bookingData.totalAmount,
        };

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
          extras: context.bookingData.extras || {},
          status: "pending",
          paymentStatus: "pending",
        });

        context.booking = booking;

        reply = `✅ Booking created successfully!\n`;
        reply += `📝 Booking ID: ${booking._id}\n`;
        reply += `💰 Amount to pay: ₹${context.bookingData.totalAmount}\n\n`;
        reply += `Click the button below to complete payment 💳`;

        action = "payment";
        data = {
          bookingId: booking._id,
          amount: context.bookingData.totalAmount,
        };
        context.step = "payment";
      } else if (userMessage.toLowerCase() === "no") {
        reply =
          "No problem! Let me know if you want to search for other vehicles or need any help.";
        context.step = "collecting_requirements";
        context.filters = {};
        context.selectedVehicle = null;
        context.bookingData = {};
      } else {
        reply = "Please reply with 'yes' to confirm booking or 'no' to cancel.";
      }
    } else if (context.step === "payment") {
      reply =
        "Your booking is ready for payment. Use the payment button above to complete your booking.";
      action = "payment";
      data = {
        bookingId: context.booking._id,
        amount: context.bookingData.totalAmount,
      };
    } else if (intent === "help") {
      reply = "📖 **Help Guide**\n\n";
      reply += "You can ask me to:\n";
      reply += "• 'Show cars in Mumbai'\n";
      reply += "• 'Find bikes under ₹500'\n";
      reply += "• 'Book an SUV for 3 days'\n";
      reply += "• 'Check my booking status'\n\n";
      reply += "What would you like to do?";
    } else {
      reply = "I'm here to help you find and book vehicles! 🚗\n\n";
      reply +=
        "Tell me what you're looking for, or type 'help' for assistance.";
      context.step = "collecting_requirements";
    }

    // Save updated context
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
      reply:
        "😅 Sorry, I'm having trouble processing your request. Please try again.",
    });
  }
};

// Get user's bookings
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
