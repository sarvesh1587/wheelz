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
  petrol: 0.08,
  diesel: 0.06,
  electric: 0.015,
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
  return CITY_DISTANCES[key] || 300;
}

function estimateFuelCost(distanceKm, fuelType, roundTrip) {
  const rate = FUEL_RATES[fuelType] || FUEL_RATES.petrol;
  const totalKm = roundTrip ? distanceKm * 2 : distanceKm;
  return Math.round(totalKm * rate * 100);
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

    let tripParams = await extractTripParams(
      tripDescription ||
        `${days || 3}-day trip from ${from || "Mumbai"} to ${to} with ${people || 2} people`,
    );

    if (from) tripParams.from = from;
    if (to) tripParams.to = to;
    if (days) tripParams.days = parseInt(days);
    if (people) tripParams.people = parseInt(people);
    if (budget) tripParams.budget = parseInt(budget);

    const vehicles = await findMatchingVehicles(tripParams);
    const plans = await buildTripPlans(tripParams, vehicles);
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
    const prompt = `Extract trip details from this description and return ONLY a valid JSON object:
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

IMPORTANT: If number of adults/people is mentioned (e.g., "7 adults", "8 people", "family of 6"), extract that number accurately. Indian cities only.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { ...defaults, ...parsed };
  } catch (err) {
    return parseFallback(description, defaults);
  }
}

// ─── Simple regex fallback parser with improved people detection ────────────
function parseFallback(description, defaults) {
  const lower = description.toLowerCase();
  const params = { ...defaults };

  const dayMatch = lower.match(/(\d+)[- ]day/);
  if (dayMatch) params.days = parseInt(dayMatch[1]);

  // 👥 IMPROVED: Better people detection
  const peoplePatterns = [
    /(\d+)\s*adults?/i,
    /(\d+)\s*people/i,
    /(\d+)\s*pax/i,
    /(\d+)\s*friends?/i,
    /(\d+)\s*persons?/i,
    /family of (\d+)/i,
    /(\d+)\s*members?/i,
  ];
  for (const pattern of peoplePatterns) {
    const match = lower.match(pattern);
    if (match) {
      params.people = parseInt(match[1]);
      break;
    }
  }

  if (lower.includes("bike") || lower.includes("motorcycle"))
    params.preferredCategory = "bike";
  if (lower.includes("car") || lower.includes("suv") || lower.includes("sedan"))
    params.preferredCategory = "car";

  if (params.people >= 5 && !params.preferredCategory)
    params.preferredCategory = "car";

  const budgetMatch = lower.match(/(?:budget|under|within|₹|rs\.?)\s*(\d+)/i);
  if (budgetMatch) params.budget = parseInt(budgetMatch[1]);

  if (lower.includes("driver") || lower.includes("chauffeur"))
    params.needDriver = true;

  const destinations = [
    "goa",
    "manali",
    "shimla",
    "ooty",
    "coorg",
    "jaipur",
    "agra",
    "mysore",
    "pondicherry",
  ];
  const found = destinations.find((c) => lower.includes(c));
  if (found) params.to = found.charAt(0).toUpperCase() + found.slice(1);

  const origins = [
    "mumbai",
    "delhi",
    "bangalore",
    "chennai",
    "hyderabad",
    "kolkata",
    "pune",
  ];
  const foundFrom = origins.find((c) => lower.includes(c) && c !== found);
  if (foundFrom)
    params.from = foundFrom.charAt(0).toUpperCase() + foundFrom.slice(1);

  return params;
}

// ─── Find vehicles matching trip requirements with capacity logic ────────────
async function findMatchingVehicles(tripParams) {
  const query = { isActive: true, isAvailable: true };
  const people = tripParams.people || 2;

  // 🚨 CRITICAL: Filter by seating capacity based on number of people
  if (people >= 6) {
    query.seatingCapacity = { $gte: Math.min(people, 8) };
    query.category = "car";
  } else if (people >= 5) {
    query.seatingCapacity = { $gte: 5 };
    query.category = "car";
  } else if (people >= 3) {
    if (tripParams.preferredCategory === "bike") {
      query.seatingCapacity = { $gte: 2 };
    } else {
      query.seatingCapacity = { $gte: Math.min(people, 5) };
      query.category = "car";
    }
  } else if (people <= 2) {
    if (tripParams.preferredCategory === "car")
      query.seatingCapacity = { $gte: 4 };
    else if (tripParams.preferredCategory === "bike")
      query.seatingCapacity = { $gte: 2 };
  }

  if (tripParams.city) {
    query.city = new RegExp(tripParams.city, "i");
  } else if (tripParams.from) {
    query.city = new RegExp(tripParams.from, "i");
  }

  if (tripParams.budget && tripParams.days) {
    const maxDaily = Math.floor(tripParams.budget / tripParams.days);
    if (maxDaily > 0) query.basePrice = { $lte: maxDaily };
  }

  if (tripParams.preferredCategory)
    query.category = tripParams.preferredCategory;
  if (people >= 4 && !tripParams.preferredCategory) query.category = "car";

  let vehicles = await Vehicle.find(query).limit(15);

  if (vehicles.length === 0 && people >= 5) {
    delete query.seatingCapacity;
    vehicles = await Vehicle.find(query).limit(15);
  }

  if (vehicles.length < 3 && query.city) {
    delete query.city;
    vehicles = await Vehicle.find(query).limit(15);
  }

  return sortVehiclesBySuitability(vehicles, tripParams);
}

// ─── Sort vehicles based on suitability for group size ──────────────────────
function sortVehiclesBySuitability(vehicles, tripParams) {
  const people = tripParams.people || 2;

  return vehicles.sort((a, b) => {
    let scoreA = 0,
      scoreB = 0;

    const capacityA = a.seatingCapacity || (a.category === "bike" ? 2 : 5);
    const capacityB = b.seatingCapacity || (b.category === "bike" ? 2 : 5);

    if (capacityA >= people) scoreA += 50;
    if (capacityB >= people) scoreB += 50;
    if (capacityA < people) scoreA -= 100;
    if (capacityB < people) scoreB -= 100;

    if (people >= 5) {
      if (capacityA >= 7) scoreA += 30;
      if (capacityB >= 7) scoreB += 30;
      if (a.name?.toLowerCase().includes("innova")) scoreA += 20;
      if (b.name?.toLowerCase().includes("innova")) scoreB += 20;
    }

    const priceA = a.basePrice || 0;
    const priceB = b.basePrice || 0;
    if (priceA < priceB) scoreA += 10;
    else if (priceB < priceA) scoreB += 10;

    const ratingA = a.averageRating || 0;
    const ratingB = b.averageRating || 0;
    if (ratingA > ratingB) scoreA += 15;
    else if (ratingB > ratingA) scoreB += 15;

    return scoreB - scoreA;
  });
}

// ─── Build trip plans with accurate group size recommendations ──────────────
async function buildTripPlans(tripParams, vehicles) {
  const distance = estimateDistance(tripParams.from, tripParams.to);
  const people = tripParams.people || 2;

  return vehicles.slice(0, 6).map((v) => {
    const rentalCost = v.basePrice * tripParams.days;
    const fuelCost = estimateFuelCost(
      distance,
      v.fuelType || "petrol",
      tripParams.roundTrip,
    );
    const driverCost = tripParams.needDriver ? 700 * tripParams.days : 0;
    const tollsEstimate = Math.round(distance * 0.5);
    const totalCost = rentalCost + fuelCost + driverCost + tollsEstimate;
    const costPerPerson = Math.round(totalCost / people);

    const capacity = v.seatingCapacity || (v.category === "bike" ? 2 : 5);
    let suitabilityScore = 70;
    let capacityMessage = "";

    if (capacity >= people) {
      suitabilityScore += 20;
      if (capacity - people <= 1) suitabilityScore += 10;
      capacityMessage = `✅ Fits ${people} people comfortably`;
    } else {
      suitabilityScore -= 50;
      capacityMessage = `⚠️ Only fits ${capacity} people (needs ${people})`;
    }

    if (people >= 5 && v.category === "car") suitabilityScore += 15;
    if (people <= 2 && v.category === "bike") suitabilityScore += 10;
    if (tripParams.preferredCategory === v.category) suitabilityScore += 10;
    if (v.fuelType === "electric") suitabilityScore += 5;
    if (
      people >= 6 &&
      (capacity >= 7 || v.name?.toLowerCase().includes("innova"))
    )
      suitabilityScore += 20;

    suitabilityScore = Math.min(Math.max(suitabilityScore, 0), 100);

    let suitabilityLabel;
    if (suitabilityScore >= 90) suitabilityLabel = "Perfect Match";
    else if (suitabilityScore >= 80) suitabilityLabel = "Great Choice";
    else if (suitabilityScore >= 70) suitabilityLabel = "Good Fit";
    else if (suitabilityScore >= 50) suitabilityLabel = "Available";
    else suitabilityLabel = "Not Recommended";

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
        seatingCapacity: capacity,
        city: v.city,
        images: v.images,
        averageRating: v.averageRating,
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
      suitabilityLabel,
      capacityMessage,
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
    const fuelCostBike = estimateFuelCost(distance, "petrol", true) * 0.5;
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
