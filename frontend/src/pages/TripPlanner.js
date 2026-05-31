import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE =
  process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api";

// ─── Popular trip suggestions ────────────────────────────────────────────────
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
  "Warangal",
  "Aurangabad",
  "Nashik",
];

export default function TripPlanner() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("form"); // "form" | "text"
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Form mode state
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

  // Text mode state
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
    window.scrollTo({ top: 300, behavior: "smooth" });
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
        setTimeout(() => {
          document
            .getElementById("trip-results")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (err) {
      toast.error("Trip planning failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookVehicle = (vehicleId) => {
    navigate(`/book/${vehicleId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <span>🤖</span> AI-Powered Trip Planner
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Plan Your Perfect Road Trip
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Tell us where you're going — Wheelz AI picks the best vehicle,
            estimates costs, and pre-fills your booking.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* ── Popular Trips ── */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Popular trips
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TRIPS.map((trip) => (
              <button
                key={trip.label}
                onClick={() => applyPopularTrip(trip)}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span>{trip.emoji}</span> {trip.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Mode Toggle ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
            <button
              onClick={() => setMode("form")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "form"
                  ? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              📋 Fill Details
            </button>
            <button
              onClick={() => setMode("text")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "text"
                  ? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              💬 Describe in Words
            </button>
          </div>

          {/* ── Text Mode ── */}
          {mode === "text" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe your trip in plain English
              </label>
              <textarea
                rows={3}
                value={tripText}
                onChange={(e) => setTripText(e.target.value)}
                placeholder='e.g. "3-day Goa trip from Mumbai with 2 friends, budget ₹8000, need automatic car"'
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                    className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Form Mode ── */}
          {mode === "form" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  📍 From
                </label>
                <select
                  name="from"
                  value={form.from}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select city</option>
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  🏁 To
                </label>
                <select
                  name="to"
                  value={form.to}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select destination</option>
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  📅 Number of Days
                </label>
                <input
                  type="number"
                  name="days"
                  min={1}
                  max={30}
                  value={form.days}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* People */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  👥 Number of People
                </label>
                <input
                  type="number"
                  name="people"
                  min={1}
                  max={10}
                  value={form.people}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  💰 Total Budget (₹){" "}
                  <span className="text-gray-400 font-normal">optional</span>
                </label>
                <input
                  type="number"
                  name="budget"
                  placeholder="e.g. 10000"
                  value={form.budget}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Vehicle preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  🚗 Vehicle Preference
                </label>
                <select
                  name="preferredCategory"
                  value={form.preferredCategory}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No preference</option>
                  <option value="car">Car / SUV</option>
                  <option value="bike">Bike / Scooter</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6 items-center pt-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="roundTrip"
                    checked={form.roundTrip}
                    onChange={handleFormChange}
                    className="rounded accent-blue-600"
                  />
                  Round Trip
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="needDriver"
                    checked={form.needDriver}
                    onChange={handleFormChange}
                    className="rounded accent-blue-600"
                  />
                  Need a Driver (+₹700/day)
                </label>
              </div>
            </div>
          )}

          {/* ── Plan Button ── */}
          <button
            onClick={handlePlan}
            disabled={loading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Planning your trip...
              </>
            ) : (
              <>🗺️ Plan My Trip</>
            )}
          </button>
        </div>

        {/* ── Results ── */}
        {result && (
          <div id="trip-results" className="space-y-6">
            {/* Trip Summary Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
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
                <div className="flex gap-3 flex-wrap text-sm">
                  <span className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300">
                    📅 {result.tripParams.days} days
                  </span>
                  <span className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300">
                    👥 {result.tripParams.people} people
                  </span>
                  <span className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300">
                    🛣️ ~{result.plans[0]?.tripDetails?.distance || "—"} km
                  </span>
                  {result.tripParams.roundTrip && (
                    <span className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300">
                      🔄 Round trip
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Plans */}
            {result.plans.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <div className="text-5xl mb-4">🚗</div>
                <p className="text-lg font-medium">
                  No vehicles found for this trip.
                </p>
                <p className="text-sm mt-1">
                  Try adjusting your budget or preferences.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  🎯 Recommended Vehicles ({result.plans.length} options)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {result.plans.map((plan, i) => (
                    <VehiclePlanCard
                      key={plan.vehicle._id}
                      plan={plan}
                      isTop={i === 0}
                      tripParams={result.tripParams}
                      onBook={() => handleBookVehicle(plan.vehicle._id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Vehicle Plan Card ───────────────────────────────────────────────────────
function VehiclePlanCard({ plan, isTop, tripParams, onBook }) {
  const { vehicle, costBreakdown, suitabilityLabel, suitabilityScore } = plan;
  const [expanded, setExpanded] = useState(false);

  const scoreColor =
    suitabilityScore >= 95
      ? "text-green-600 bg-green-50 border-green-200"
      : suitabilityScore >= 88
        ? "text-blue-600 bg-blue-50 border-blue-200"
        : "text-gray-600 bg-gray-50 border-gray-200";

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl border transition-shadow hover:shadow-md overflow-hidden ${isTop ? "border-blue-400 dark:border-blue-600 shadow-md" : "border-gray-200 dark:border-gray-800"}`}
    >
      {isTop && (
        <div className="bg-blue-600 text-white text-xs font-semibold text-center py-1.5 tracking-wide">
          ⭐ AI TOP PICK
        </div>
      )}

      <div className="p-5">
        {/* Vehicle header */}
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
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
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                  {vehicle.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                  {vehicle.fuelType} • {vehicle.transmission} •{" "}
                  {vehicle.seats || (vehicle.category === "bike" ? 2 : 5)} seats
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-lg border flex-shrink-0 ${scoreColor}`}
              >
                {suitabilityLabel}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-yellow-400 text-xs">★</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {vehicle.rating?.toFixed(1) || "New"} • ₹
                {vehicle.basePrice?.toLocaleString()}/day
              </span>
            </div>
          </div>
        </div>

        {/* Cost highlight */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Total Trip Cost
            </span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
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

          {/* Breakdown toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            {expanded ? "▲ Hide breakdown" : "▼ See cost breakdown"}
          </button>

          {expanded && (
            <div className="mt-3 space-y-1.5 border-t border-gray-200 dark:border-gray-700 pt-3">
              {[
                [
                  "🚗 Rental",
                  `₹${costBreakdown.rentalCost.toLocaleString()}`,
                  `₹${vehicle.basePrice}/day × ${tripParams.days} days`,
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
              <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                  Total
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  ₹{costBreakdown.totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Book button */}
        <button
          onClick={onBook}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
        >
          Book This Vehicle →
        </button>
      </div>
    </div>
  );
}
