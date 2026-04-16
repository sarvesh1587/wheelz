/**
 * AI Controller with Google Gemini (Free)
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Vehicle = require('../models/Vehicle');

// Initialize Gemini (free tier)
let genAI = null;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (err) {
  console.log('Gemini not configured, using fallback mode');
}

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    let reply = "";
    
    // Try Gemini if available
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `You are Zara, a friendly AI assistant for Wheelz (car & bike rental platform in India). 
        Keep responses concise, helpful, and under 100 words.
        User question: ${message}`;
        
        const result = await model.generateContent(prompt);
        reply = result.response.text();
      } catch (err) {
        console.log('Gemini error, using fallback');
        reply = getFallbackResponse(message);
      }
    } else {
      reply = getFallbackResponse(message);
    }
    
    // Get vehicle suggestions
    let suggestions = [];
    const msg = message.toLowerCase();
    if (msg.includes('car') || msg.includes('suv')) {
      suggestions = await Vehicle.find({ category: 'car', isAvailable: true }).limit(3);
    } else if (msg.includes('bike')) {
      suggestions = await Vehicle.find({ category: 'bike', isAvailable: true }).limit(3);
    }
    
    res.json({ success: true, reply, suggestions });
  } catch (err) {
    res.json({ 
      success: true, 
      reply: "Hi! I'm Zara. Ask me about cars, bikes, pricing, or bookings! 🚗",
      suggestions: [] 
    });
  }
};

// Smart search with keyword extraction
exports.smartSearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    const lower = query.toLowerCase();
    
    const params = {};
    
    // Extract parameters
    if (lower.includes('car')) params.category = 'car';
    if (lower.includes('bike')) params.category = 'bike';
    
    const priceMatch = lower.match(/under\s+(\d+)|below\s+(\d+)|₹\s*(\d+)/);
    if (priceMatch) params.maxPrice = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]);
    
    const cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'hyderabad', 'pune'];
    const foundCity = cities.find(c => lower.includes(c));
    if (foundCity) params.city = foundCity;
    
    if (lower.includes('electric')) params.fuelType = 'electric';
    if (lower.includes('automatic')) params.transmission = 'automatic';
    
    // Build query
    const queryObj = { isActive: true };
    if (params.category) queryObj.category = params.category;
    if (params.city) queryObj.city = new RegExp(params.city, 'i');
    if (params.fuelType) queryObj.fuelType = params.fuelType;
    if (params.transmission) queryObj.transmission = params.transmission;
    if (params.maxPrice) queryObj.basePrice = { $lte: params.maxPrice };
    
    const vehicles = await Vehicle.find(queryObj).limit(8);
    
    res.json({ success: true, vehicles, extractedParams: params });
  } catch (err) {
    next(err);
  }
};

// Fallback responses (no API needed)
function getFallbackResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('hi') || msg.includes('hello')) 
    return "👋 Hello! I'm Zara, your Wheelz assistant. How can I help?";
  if (msg.includes('car')) 
    return "🚗 We have great cars from ₹1200/day! SUVs, sedans, hatchbacks available.";
  if (msg.includes('bike')) 
    return "🏍️ Bikes starting at ₹350/day! Royal Enfield, KTM, scooters available.";
  if (msg.includes('price')) 
    return "💰 Prices: Bikes ₹350-1200/day | Cars ₹1200-8000/day";
  if (msg.includes('book')) 
    return "📅 Booking is easy! Select dates → Add extras → Pay online";
  if (msg.includes('cancel')) 
    return "❌ Free cancellation up to 24 hours before pickup";
  
  return "I can help with vehicle recommendations, pricing, booking, and cancellations! What would you like to know?";
}

exports.getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await Vehicle.find({ isActive: true, isAvailable: true })
      .sort({ popularityScore: -1 })
      .limit(6);
    res.json({ success: true, recommendations });
  } catch (err) {
    next(err);
  }
};

exports.getFraudAlerts = async (req, res, next) => {
  try {
    const { Booking } = require('../models/Booking');
    const flaggedBookings = await Booking.find({ isFlagged: true, reviewedByAdmin: false })
      .populate('user', 'name email')
      .populate('vehicle', 'name');
    res.json({ success: true, flaggedBookings, flaggedUsers: [] });
  } catch (err) {
    next(err);
  }
};

exports.resolveFraudAlert = async (req, res, next) => {
  try {
    const { Booking } = require('../models/Booking');
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { reviewedByAdmin: true },
      { new: true }
    );
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};