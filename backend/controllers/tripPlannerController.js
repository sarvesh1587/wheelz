/**
 * Trip Planner AI Controller
 * Integrated into Wheelz backend (Node/Express/MongoDB)
 * Uses Gemini (same as aiController.js) with smart fallback
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Vehicle = require("../models/Vehicle");

let genAI = null;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (err) {
  console.log("Gemini not configured for trip planner, using fallback");
}

// ─── Fuel cost constants (INR per km, approximate) ──────────────────────────
const FUEL_RATES = {
  petrol: 0.08, // ₹8 per km approx (petrol ~₹100/L, 12km/L)
  diesel: 0.06, // ₹6 per km approx (diesel ~₹90/L, 15km/L)
  electric: 0.015, // ₹1.5 per km approx (electricity cost)
  cng: 0.04,
};

// ─── Approximate distances between major Indian cities (km) ─────────────────
const CITY_DISTANCES = {
  "mumbai-pune": 150,
  "pune-mumbai": 150,
  "mumbai-goa": 590,
  "goa-mumbai": 590,
  "mumbai-nashik": 165,
  "nashik-mumbai": 165,
  "mumbai-aurangabad": 335,
  "aurangabad-mumbai": 335,
  "delhi-agra": 210,
  "agra-delhi": 210,
  "delhi-jaipur": 280,
  "jaipur-delhi": 280,
  "delhi-chandigarh": 250,
  "chandigarh-delhi": 250,
  "delhi-shimla": 350,
  "shimla-delhi": 350,
  "delhi-manali": 540,
  "manali-delhi": 540,
  "bangalore-mysore": 150,
  "mysore-bangalore": 150,
  "bangalore-ooty": 260,
  "ooty-bangalore": 260,
  "bangalore-coorg": 260,
  "coorg-bangalore": 260,
  "bangalore-goa": 560,
  "goa-bangalore": 560,
  "chennai-pondicherry": 160,
  "pondicherry-chennai": 160,
  "chennai-mahabalipuram": 60,
  "mahabalipuram-chennai": 60,
  "hyderabad-warangal": 150,
  "warangal-hyderabad": 150,
  "hyderabad-vijayawada": 275,
  "vijayawada-hyderabad": 275,
  "kolkata-digha": 185,
  "digha-kolkata": 185,
  "kolkata-darjeeling": 620,
  "darjeeling-kolkata": 620,
};

function estimateDistance(from, to) {
  const key = `${from.toLowerCase()}-${to.toLowerCase()}`;
  return CITY_DISTANCES[key] || 300; // default 300km if unknown
}

function estimateFuelCost(distanceKm, fuelType, roundTrip) {
  const rate = FUEL_RATES[fuelType] || FUEL_RATES.petrol;
  const totalKm = roundTrip ? distanceKm * 2 : distanceKm;
  return Math.round(totalKm * rate * 100); // return in paise → ₹
}

// ─── Main Trip Planner ───────────────────────────────────────────────────────
exports.planTrip = async (req, res) => {
  try {
    const { tripDescription, from, to, days, people, budget } = req.body;

    if (!tripDescription && !to) {
      return res
        .status(400)
        .json({ success: false, message: "Please describe your trip." });
    }

    // 1. Extract trip parameters using Gemini or fallback parser
    let tripParams = await extractTripParams(
      tripDescription ||
        `${days || 3}-day trip from ${from || "Mumbai"} to ${to} with ${people || 2} people`,
    );

    // Override with explicit fields if provided
    if (from) tripParams.from = from;
    if (to) tripParams.to = to;
    if (days) tripParams.days = parseInt(days);
    if (people) tripParams.people = parseInt(people);
    if (budget) tripParams.budget = parseInt(budget);

    // 2. Find matching vehicles
    const vehicles = await findMatchingVehicles(tripParams);

    // 3. Build itinerary + cost estimate for top vehicles
    const plans = await buildTripPlans(tripParams, vehicles);

    // 4. Generate AI description for the trip
    const tripSummary = await generateTripSummary(tripParams);

    res.json({
      success: true,
      tripParams,
      plans,
      tripSummary,
      totalVehiclesFound: vehicles.length,
    });
  } catch (err) {
    console.error("Trip planner error:", err);
    res.status(500).json({ success: false, message: "Trip planner failed." });
  }
};

// ─── Extract structured params from natural language ────────────────────────
async function extractTripParams(description) {
  const defaults = {
    from: "Mumbai",
    to: "Goa",
    days: 3,
    people: 2,
    budget: null,
    tripType: "leisure",
    preferredCategory: null,
    needDriver: false,
    roundTrip: true,
  };

  if (!genAI) return parseFallback(description, defaults);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Extract trip details from this description and return ONLY a valid JSON object (no markdown, no explanation):
"${description}"

Return this exact JSON structure:
{
  "from": "city name",
  "to": "destination city",
  "days": number,
  "people": number,
  "budget": number or null,
  "tripType": "leisure|business|adventure|family",
  "preferredCategory": "car|bike|null",
  "needDriver": boolean,
  "roundTrip": boolean
}

Indian cities only. Default roundTrip to true. If budget mentioned convert to number in INR.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { ...defaults, ...parsed };
  } catch (err) {
    return parseFallback(description, defaults);
  }
}

// ─── Simple regex fallback parser ───────────────────────────────────────────
function parseFallback(description, defaults) {
  const lower = description.toLowerCase();
  const params = { ...defaults };

  // Days
  const dayMatch = lower.match(/(\d+)[- ]day/);
  if (dayMatch) params.days = parseInt(dayMatch[1]);

  // People
  const peopleMatch = lower.match(/(\d+)\s*(friend|person|people|passenger)/);
  if (peopleMatch) params.people = parseInt(peopleMatch[1]);

  // Category
  if (lower.includes("bike") || lower.includes("motorcycle"))
    params.preferredCategory = "bike";
  if (lower.includes("car") || lower.includes("suv"))
    params.preferredCategory = "car";

  // Budget
  const budgetMatch = lower.match(/(?:budget|under|within|₹)\s*(\d+)/);
  if (budgetMatch) params.budget = parseInt(budgetMatch[1]);

  // Driver
  if (lower.includes("driver") || lower.includes("chauffeur"))
    params.needDriver = true;

  // Common destinations
  const cities = [
    "goa",
    "manali",
    "shimla",
    "ooty",
    "coorg",
    "jaipur",
    "agra",
    "pune",
    "mysore",
    "pondicherry",
  ];
  const found = cities.find((c) => lower.includes(c));
  if (found) params.to = found.charAt(0).toUpperCase() + found.slice(1);

  const fromCities = [
    "mumbai",
    "delhi",
    "bangalore",
    "chennai",
    "hyderabad",
    "kolkata",
    "pune",
  ];
  const foundFrom = fromCities.find((c) => lower.includes(c) && c !== found);
  if (foundFrom)
    params.from = foundFrom.charAt(0).toUpperCase() + foundFrom.slice(1);

  return params;
}

// ─── Find vehicles matching trip requirements ────────────────────────────────
async function findMatchingVehicles(tripParams) {
  const query = { isActive: true, isAvailable: true };

  // City match - try destination first, then origin
  const cityRegex = new RegExp(tripParams.from, "i");
  query.city = cityRegex;

  if (tripParams.preferredCategory) {
    query.category = tripParams.preferredCategory;
  }

  // For groups of 4+, prefer cars/SUVs
  if (tripParams.people >= 4 && !tripParams.preferredCategory) {
    query.category = "car";
  }

  // Budget filter - rough estimate: daily price × days should be within budget
  if (tripParams.budget && tripParams.days) {
    const maxDaily = Math.floor(tripParams.budget / tripParams.days);
    if (maxDaily > 0) query.basePrice = { $lte: maxDaily };
  }

  let vehicles = await Vehicle.find(query).limit(10);

  // Fallback: drop city filter if too restrictive
  if (vehicles.length < 3) {
    delete query.city;
    vehicles = await Vehicle.find(query).limit(10);
  }

  // Fallback: drop category too
  if (vehicles.length < 3) {
    delete query.category;
    vehicles = await Vehicle.find(query).limit(10);
  }

  return vehicles;
}

// ─── Build trip plans with cost breakdown ───────────────────────────────────
async function buildTripPlans(tripParams, vehicles) {
  const distance = estimateDistance(tripParams.from, tripParams.to);

  return vehicles.slice(0, 4).map((v) => {
    const rentalCost = v.basePrice * tripParams.days;
    const fuelCost = estimateFuelCost(
      distance,
      v.fuelType || "petrol",
      tripParams.roundTrip,
    );
    const driverCost = tripParams.needDriver ? 700 * tripParams.days : 0;
    const tollsEstimate = Math.round(distance * 0.5); // ₹0.5/km rough toll estimate
    const totalCost = rentalCost + fuelCost + driverCost + tollsEstimate;
    const costPerPerson = Math.round(totalCost / (tripParams.people || 1));

    // Suitability score
    let suitabilityScore = 80;
    if (tripParams.people >= 4 && v.category === "car") suitabilityScore += 10;
    if (tripParams.people <= 2 && v.category === "bike") suitabilityScore += 10;
    if (tripParams.preferredCategory === v.category) suitabilityScore += 10;
    if (v.fuelType === "electric") suitabilityScore += 5; // eco bonus
    suitabilityScore = Math.min(suitabilityScore, 99);

    return {
      vehicle: {
        _id: v._id,
        name: v.name,
        category: v.category,
        brand: v.brand,
        model: v.model,
        basePrice: v.basePrice,
        fuelType: v.fuelType,
        transmission: v.transmission,
        seats: v.seats,
        city: v.city,
        images: v.images,
        rating: v.rating,
      },
      costBreakdown: {
        rentalCost,
        fuelCost,
        driverCost,
        tollsEstimate,
        totalCost,
        costPerPerson,
      },
      tripDetails: {
        distance,
        roundTrip: tripParams.roundTrip,
        totalKm: tripParams.roundTrip ? distance * 2 : distance,
      },
      suitabilityScore,
      suitabilityLabel:
        suitabilityScore >= 95
          ? "Perfect Match"
          : suitabilityScore >= 88
            ? "Great Choice"
            : suitabilityScore >= 80
              ? "Good Fit"
              : "Available",
    };
  });
}

// ─── Generate AI trip summary ────────────────────────────────────────────────
async function generateTripSummary(tripParams) {
  if (!genAI) {
    return `A ${tripParams.days}-day trip from ${tripParams.from} to ${tripParams.to} for ${tripParams.people} people. Estimated distance: ~${estimateDistance(tripParams.from, tripParams.to)}km one way. Have a great trip! 🚗`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Write a 2-sentence exciting trip summary for: ${tripParams.days}-day trip from ${tripParams.from} to ${tripParams.to} for ${tripParams.people} people. Mention 1 must-visit spot. Keep it under 60 words. No emojis in the middle of sentences.`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return `A wonderful ${tripParams.days}-day journey from ${tripParams.from} to ${tripParams.to} awaits! Perfect for ${tripParams.people} traveller${tripParams.people > 1 ? "s" : ""} looking for an unforgettable road trip experience.`;
  }
}

// ─── Quick estimate (lightweight, no DB) ────────────────────────────────────
exports.quickEstimate = async (req, res) => {
  try {
    const { from, to, days, people } = req.body;
    const distance = estimateDistance(from || "Mumbai", to || "Goa");
    const fuelCostBike = estimateFuelCost(distance, "petrol", true) * 0.5; // bikes use less
    const fuelCostCar = estimateFuelCost(distance, "petrol", true);

    res.json({
      success: true,
      distance,
      estimates: {
        bike: {
          rentalRange: `₹${350 * (days || 3)}–₹${800 * (days || 3)}`,
          fuelCost: Math.round(fuelCostBike),
          totalRange: `₹${Math.round(350 * (days || 3) + fuelCostBike)}–₹${Math.round(800 * (days || 3) + fuelCostBike)}`,
          perPerson: Math.round(
            (600 * (days || 3) + fuelCostBike) / (people || 2),
          ),
        },
        car: {
          rentalRange: `₹${1200 * (days || 3)}–₹${3000 * (days || 3)}`,
          fuelCost: Math.round(fuelCostCar),
          totalRange: `₹${Math.round(1200 * (days || 3) + fuelCostCar)}–₹${Math.round(3000 * (days || 3) + fuelCostCar)}`,
          perPerson: Math.round(
            (2000 * (days || 3) + fuelCostCar) / (people || 2),
          ),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Estimation failed." });
  }
};
