/**
 * AI Controller
 * Powers: Chatbot, Recommendations, Smart NL Search, Fraud Review
 */

const Vehicle = require("../models/Vehicle");
const { Booking } = require("../models/Booking");
const User = require("../models/User");

exports.chat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    const systemPrompt = `You are Zara, the friendly AI assistant for Wheelz - a premium car and bike rental platform in India.

Your role:
- Help customers find the right vehicle based on their needs and budget
- Answer questions about pricing, availability, booking process, cancellations, and policies
- Suggest vehicles based on user requirements
- Keep responses concise, friendly, and helpful (under 150 words unless explaining something complex)

Platform info:
- We offer cars (sedans, SUVs, hatchbacks, luxury) and bikes (cruisers, sports, scooters)
- Prices range from ₹300/day for bikes to ₹5000/day for luxury cars
- Bookings require ID verification and are confirmed instantly after payment
- Free cancellation up to 24 hours before pickup
- We operate in major Indian cities`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          ...conversationHistory.slice(-8),
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "AI service unavailable");
    }

    const reply =
      data.content?.[0]?.text ||
      "I'm having trouble responding right now. Please try again!";

    let suggestions = [];
    const mentionedCategories = [];
    if (/bike|motorcycle|scooter/i.test(reply))
      mentionedCategories.push("bike");
    if (/car|sedan|suv|hatchback/i.test(reply)) mentionedCategories.push("car");

    if (mentionedCategories.length > 0) {
      suggestions = await Vehicle.find({
        category: { $in: mentionedCategories },
        isAvailable: true,
        isActive: true,
      })
        .limit(3)
        .select("name brand images basePrice category city");
    }

    res.json({ success: true, reply, suggestions });
  } catch (err) {
    console.error("AI Chat error:", err.message);
    res.json({
      success: true,
      reply:
        "I'm Zara, your Wheelz assistant! I'm experiencing a brief hiccup. For immediate help, you can browse vehicles or contact our support team.",
      suggestions: [],
    });
  }
};

exports.smartSearch = async (req, res, next) => {
  try {
    const { query } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 300,
        system: `Extract vehicle search parameters from natural language queries. Return ONLY valid JSON, no other text.
Schema: {"category": "car|bike|null", "maxPrice": number|null, "city": "string|null", "fuelType": "petrol|diesel|electric|null", "subCategory": "sedan|suv|hatchback|luxury|cruiser|sports|scooter|null", "features": ["AC","GPS"]|null}`,
        messages: [{ role: "user", content: query }],
      }),
    });

    const data = await response.json();
    let params = {};

    try {
      const text = data.content?.[0]?.text || "{}";
      params = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      params = extractParamsFromText(query);
    }

    const mongoQuery = { isActive: true, isAvailable: true };
    if (params.category) mongoQuery.category = params.category;
    if (params.maxPrice) mongoQuery.basePrice = { $lte: params.maxPrice };
    if (params.city) mongoQuery.city = new RegExp(params.city, "i");
    if (params.fuelType) mongoQuery.fuelType = params.fuelType;
    if (params.subCategory) mongoQuery.subCategory = params.subCategory;

    const vehicles = await Vehicle.find(mongoQuery)
      .sort({ popularityScore: -1, averageRating: -1 })
      .limit(8)
      .select(
        "name brand images basePrice currentPrice category city averageRating totalReviews isAvailable",
      );

    res.json({ success: true, vehicles, extractedParams: params, query });
  } catch (err) {
    next(err);
  }
};

function extractParamsFromText(text) {
  const lower = text.toLowerCase();
  const params = {};
  if (/bike|motorcycle|scooter/.test(lower)) params.category = "bike";
  else if (/car|sedan|suv|hatchback/.test(lower)) params.category = "car";
  const priceMatch = lower.match(
    /under\s+(\d+)|below\s+(\d+)|₹\s*(\d+)|rs\.?\s*(\d+)/,
  );
  if (priceMatch)
    params.maxPrice = parseInt(
      priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4],
    );
  const cities = [
    "mumbai",
    "delhi",
    "bangalore",
    "bengaluru",
    "hyderabad",
    "chennai",
    "pune",
    "jaipur",
    "kolkata",
    "kota",
  ];
  const cityFound = cities.find((c) => lower.includes(c));
  if (cityFound) params.city = cityFound;
  if (/electric|ev/.test(lower)) params.fuelType = "electric";
  return params;
}

exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    let recommendations = [];
    let reason = "popular";

    if (userId) {
      const bookings = await Booking.find({
        user: userId,
        status: { $in: ["confirmed", "completed"] },
      })
        .populate("vehicle", "category subCategory fuelType basePrice city")
        .sort({ createdAt: -1 })
        .limit(10);

      const user = await User.findById(userId);

      if (bookings.length > 0) {
        const categories = bookings
          .map((b) => b.vehicle?.category)
          .filter(Boolean);
        const fuelTypes = bookings
          .map((b) => b.vehicle?.fuelType)
          .filter(Boolean);
        const avgSpend =
          bookings.reduce((sum, b) => sum + b.pricePerDay, 0) / bookings.length;
        const favCategory = categories.sort(
          (a, b) =>
            categories.filter((v) => v === b).length -
            categories.filter((v) => v === a).length,
        )[0];
        const favFuel = fuelTypes[0];

        const query = {
          isActive: true,
          isAvailable: true,
          category: favCategory,
          basePrice: { $lte: avgSpend * 1.3 },
        };
        if (favFuel) query.fuelType = favFuel;

        recommendations = await Vehicle.find(query)
          .sort({ averageRating: -1, popularityScore: -1 })
          .limit(6);
        reason = "based on your booking history";
      }

      if (recommendations.length < 6) {
        const budget = user?.preferences?.maxBudget || 2000;
        const city = user?.address?.city;
        const extraQuery = {
          isActive: true,
          isAvailable: true,
          basePrice: { $lte: budget },
        };
        if (city) extraQuery.city = new RegExp(city, "i");

        const extra = await Vehicle.find({
          ...extraQuery,
          _id: { $nin: recommendations.map((r) => r._id) },
        })
          .sort({ popularityScore: -1 })
          .limit(6 - recommendations.length);

        recommendations = [...recommendations, ...extra];
        if (recommendations.length > 0) reason = "matching your preferences";
      }
    }

    if (recommendations.length === 0) {
      recommendations = await Vehicle.find({
        isActive: true,
        isAvailable: true,
      })
        .sort({ popularityScore: -1, averageRating: -1 })
        .limit(6);
    }

    res.json({ success: true, recommendations, reason });
  } catch (err) {
    next(err);
  }
};

exports.getFraudAlerts = async (req, res, next) => {
  try {
    const flaggedBookings = await Booking.find({
      isFlagged: true,
      reviewedByAdmin: false,
    })
      .populate("user", "name email fraudScore cancellationCount")
      .populate("vehicle", "name category")
      .sort({ createdAt: -1 });

    const flaggedUsers = await User.find({ flaggedForReview: true })
      .select("name email fraudScore cancellationCount fraudReasons")
      .sort({ fraudScore: -1 });

    res.json({ success: true, flaggedBookings, flaggedUsers });
  } catch (err) {
    next(err);
  }
};

exports.resolveFraudAlert = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { reviewedByAdmin: true, isFlagged: req.body.keepFlagged || false },
      { new: true },
    );
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};
