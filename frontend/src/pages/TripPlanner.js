import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  SparklesIcon,
  ArrowPathIcon,
  HeartIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShieldCheckIcon,
  WifiIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

const API_BASE =
  process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api";

// Popular trip suggestions
const POPULAR_TRIPS = [
  {
    label: "Mumbai → Goa",
    from: "Mumbai",
    to: "Goa",
    days: 3,
    people: 2,
    emoji: "🏖️",
  },
  {
    label: "Delhi → Manali",
    from: "Delhi",
    to: "Manali",
    days: 5,
    people: 4,
    emoji: "🏔️",
  },
  {
    label: "Bangalore → Coorg",
    from: "Bangalore",
    to: "Coorg",
    days: 2,
    people: 2,
    emoji: "🌿",
  },
  {
    label: "Delhi → Jaipur",
    from: "Delhi",
    to: "Jaipur",
    days: 2,
    people: 3,
    emoji: "🏰",
  },
  {
    label: "Chennai → Pondicherry",
    from: "Chennai",
    to: "Pondicherry",
    days: 2,
    people: 2,
    emoji: "⛵",
  },
  {
    label: "Bangalore → Goa",
    from: "Bangalore",
    to: "Goa",
    days: 4,
    people: 4,
    emoji: "🎉",
  },
];

const INDIAN_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Nagpur",
  "Goa",
  "Manali",
  "Shimla",
  "Ooty",
  "Coorg",
  "Mysore",
  "Agra",
  "Chandigarh",
  "Pondicherry",
];

export default function TripPlanner() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("form");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    from: "",
    to: "",
    days: 3,
    people: 2,
    budget: "",
    needDriver: false,
    roundTrip: true,
    preferredCategory: "",
  });
  const [tripText, setTripText] = useState("");

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const applyPopularTrip = (trip) => {
    setForm((prev) => ({
      ...prev,
      from: trip.from,
      to: trip.to,
      days: trip.days,
      people: trip.people,
    }));
    setMode("form");
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handlePlan = async () => {
    const payload =
      mode === "text"
        ? { tripDescription: tripText }
        : {
            from: form.from,
            to: form.to,
            days: parseInt(form.days),
            people: parseInt(form.people),
            budget: form.budget ? parseInt(form.budget) : null,
            needDriver: form.needDriver,
            roundTrip: form.roundTrip,
            preferredCategory: form.preferredCategory || null,
          };

    if (mode === "form" && (!form.from || !form.to)) {
      toast.error("Please select origin and destination cities.");
      return;
    }
    if (mode === "text" && !tripText.trim()) {
      toast.error("Please describe your trip.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${API_BASE}/trip-planner/plan`, payload);
      if (res.data.success) {
        setResult(res.data);
        setTimeout(
          () =>
            document
              .getElementById("trip-results")
              ?.scrollIntoView({ behavior: "smooth" }),
          100,
        );
      }
    } catch (err) {
      toast.error("Trip planning failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookVehicle = (vehicleId) => navigate(`/book/${vehicleId}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <SparklesIcon className="w-4 h-4 animate-pulse" />
            AI-Powered Trip Planner
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Plan Your Perfect Road Trip
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
            Tell us where you're going — Wheelz AI picks the best vehicle,
            estimates costs, and pre-fills your booking.
          </p>
        </motion.div>

        {/* Popular Trips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            🔥 Popular routes
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TRIPS.map((trip, idx) => (
              <motion.button
                key={trip.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => applyPopularTrip(trip)}
                className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-amber-400 hover:text-amber-500 transition-all hover:shadow-md"
              >
                <span>{trip.emoji}</span> {trip.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 overflow-hidden"
        >
          {/* Mode Toggle */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
            {["form", "text"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-4 text-center font-medium transition-all ${
                  mode === m
                    ? "bg-white dark:bg-gray-800 text-amber-500 border-b-2 border-amber-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-amber-400"
                }`}
              >
                {m === "form" ? "📋 Fill Details" : "💬 Describe in Words"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {mode === "text" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Describe your trip in plain English
                </label>
                <textarea
                  rows={4}
                  value={tripText}
                  onChange={(e) => setTripText(e.target.value)}
                  placeholder='e.g., "3-day Goa trip from Mumbai with 2 friends, budget ₹8000, need automatic car"'
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    "3-day Goa trip from Mumbai with 2 friends",
                    "Weekend Manali trip for 4 people with SUV",
                    "Coorg trip from Bangalore, budget ₹5000",
                  ].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setTripText(ex)}
                      className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4 text-amber-500" /> From
                  </label>
                  <select
                    name="from"
                    value={form.from}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select city</option>
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4 text-amber-500" /> To
                  </label>
                  <select
                    name="to"
                    value={form.to}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select destination</option>
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-amber-500" /> Days
                  </label>
                  <input
                    type="number"
                    name="days"
                    min={1}
                    max={30}
                    value={form.days}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4 text-amber-500" /> People
                  </label>
                  <input
                    type="number"
                    name="people"
                    min={1}
                    max={10}
                    value={form.people}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                    <CurrencyRupeeIcon className="w-4 h-4 text-amber-500" />{" "}
                    Total Budget (Optional)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    placeholder="e.g., 10000"
                    value={form.budget}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                    🚗 Vehicle Preference
                  </label>
                  <select
                    name="preferredCategory"
                    value={form.preferredCategory}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">No preference</option>
                    <option value="car">Car / SUV</option>
                    <option value="bike">Bike / Scooter</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex gap-6 items-center pt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      name="roundTrip"
                      checked={form.roundTrip}
                      onChange={handleFormChange}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    Round Trip
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      name="needDriver"
                      checked={form.needDriver}
                      onChange={handleFormChange}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    Need a Driver (+₹700/day)
                  </label>
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlan}
              disabled={loading}
              className="mt-6 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" /> Planning
                  your trip...
                </>
              ) : (
                <>🗺️ Plan My Trip</>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              id="trip-results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 mt-8"
            >
              {/* Trip Summary Card */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">🗺️</span>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {result.tripParams.from} → {result.tripParams.to}
                      </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 max-w-lg">
                      {result.tripSummary}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700">
                      📅 {result.tripParams.days} days
                    </span>
                    <span className="bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700">
                      👥 {result.tripParams.people} people
                    </span>
                    <span className="bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700">
                      🛣️ ~{result.plans[0]?.tripDetails?.distance || "—"} km
                    </span>
                    {result.tripParams.roundTrip && (
                      <span className="bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700">
                        🔄 Round trip
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicle Cards */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-500" />
                Recommended Vehicles ({result.plans.length} options)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.plans.map((plan, idx) => (
                  <VehiclePlanCard
                    key={plan.vehicle._id}
                    plan={plan}
                    isTop={idx === 0}
                    tripParams={result.tripParams}
                    onBook={() => handleBookVehicle(plan.vehicle._id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Vehicle Plan Card Component
function VehiclePlanCard({ plan, isTop, tripParams, onBook }) {
  const [expanded, setExpanded] = useState(false);
  const { vehicle, costBreakdown, suitabilityLabel, suitabilityScore } = plan;

  const scoreColor =
    suitabilityScore >= 95
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
      : suitabilityScore >= 88
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all hover:shadow-xl overflow-hidden relative ${isTop ? "border-amber-400 dark:border-amber-600 shadow-lg" : "border-gray-200 dark:border-gray-700"}`}
    >
      {isTop && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold text-center py-1.5 tracking-wide">
          ⭐ AI TOP PICK
        </div>
      )}

      <div className="p-5">
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
            {vehicle.images?.[0] ? (
              <img
                src={vehicle.images[0]}
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                {vehicle.category === "bike" ? "🏍️" : "🚗"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">
                  {vehicle.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {vehicle.fuelType} • {vehicle.transmission} •{" "}
                  {vehicle.seats || (vehicle.category === "bike" ? 2 : 5)} seats
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-lg border ${scoreColor}`}
              >
                {suitabilityLabel}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-amber-500 text-xs">★</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {vehicle.rating?.toFixed(1) || "New"} • ₹
                {vehicle.basePrice?.toLocaleString()}/day
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Total Trip Cost
            </span>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
              ₹{costBreakdown.totalCost.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Per person
            </span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              ₹{costBreakdown.costPerPerson.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            {expanded ? (
              <ChevronUpIcon className="w-3 h-3" />
            ) : (
              <ChevronDownIcon className="w-3 h-3" />
            )}{" "}
            {expanded ? "Hide breakdown" : "See cost breakdown"}
          </button>
          {expanded && (
            <div className="mt-3 space-y-1.5 border-t border-gray-200 dark:border-gray-600 pt-3">
              {[
                [
                  "🚗 Rental",
                  `₹${costBreakdown.rentalCost.toLocaleString()}`,
                  `₹{vehicle.basePrice}/day × ${tripParams.days} days`,
                ],
                [
                  "⛽ Fuel",
                  `₹${costBreakdown.fuelCost.toLocaleString()}`,
                  `~${plan.tripDetails.totalKm}km total`,
                ],
                [
                  "🛣️ Tolls (est.)",
                  `₹${costBreakdown.tollsEstimate.toLocaleString()}`,
                  "approximate",
                ],
                ...(costBreakdown.driverCost > 0
                  ? [
                      [
                        "👨‍✈️ Driver",
                        `₹${costBreakdown.driverCost.toLocaleString()}`,
                        `₹700/day × ${tripParams.days} days`,
                      ],
                    ]
                  : []),
              ].map(([label, amount, note]) => (
                <div key={label} className="flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {label}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                      ({note})
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    {amount}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-600 pt-2 mt-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                  Total
                </span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  ₹{costBreakdown.totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBook}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md"
        >
          Book This Vehicle →
        </motion.button>
      </div>
    </motion.div>
  );
}
