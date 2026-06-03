/**
 * FindTrip Page — Premium Wheelz Rideshare Search (Amber Theme)
 * File: frontend/src/pages/FindTrip.js
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BoltIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  ArrowRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const API =
  process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api";

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Goa",
  "Manali",
  "Shimla",
  "Ooty",
  "Coorg",
  "Mysore",
  "Agra",
  "Chandigarh",
  "Pondicherry",
  "Nashik",
  "Aurangabad",
  "Surat",
  "Lucknow",
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.01, y: -2, transition: { duration: 0.2 } },
};

export default function FindTrip() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
    seats: 1,
    womenOnly: false,
  });
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [suggestions, setSuggestions] = useState({ from: [], to: [] });
  const [focusedField, setFocusedField] = useState(null);

  // City autocomplete suggestions
  const handleCityInput = (value, field) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (value.length > 0) {
      const filtered = CITIES.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase()),
      );
      setSuggestions((f) => ({ ...f, [field]: filtered }));
    } else {
      setSuggestions((f) => ({ ...f, [field]: [] }));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!form.from || !form.to)
      return toast.error("Please select From and To cities");

    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams();
      params.append("from", form.from);
      params.append("to", form.to);
      if (form.date) params.append("date", form.date);
      if (form.seats) params.append("seats", form.seats);
      if (form.womenOnly) params.append("womenOnly", "true");

      console.log("🔍 Searching with params:", params.toString());

      const res = await axios.get(`${API}/rideshare/search`, { params });
      console.log("📋 Response:", res.data);

      setTrips(res.data.trips || []);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const swap = () => {
    setForm((f) => ({ ...f, from: f.to, to: f.from }));
    toast.success("Routes swapped", {
      icon: "🔄",
      style: {
        background: "#111827",
        color: "#F9FAFB",
        border: "1px solid rgba(255,255,255,0.08)",
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0B1120]">
      {/* Ambient background glow - Amber */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-600/5 pointer-events-none" />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 via-amber-800/5 to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300">Premium Ridesharing</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              <span className="text-white">Find Your </span>
              <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                Perfect Ride
              </span>
            </h1>

            <p className="text-gray-400 text-lg max-w-lg mx-auto">
              Connect with verified drivers. Split costs. Travel sustainably.
              Experience premium carpooling.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 pb-16">
        {/* Search Form Card */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSearch}
          className="glass-card rounded-2xl p-8 mb-10"
          style={{
            boxShadow: "0 0 30px rgba(245, 158, 11, 0.1)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* From City */}
            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                <MapPinIcon className="w-4 h-4 text-amber-400" />
                From
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.from}
                  onChange={(e) => handleCityInput(e.target.value, "from")}
                  onFocus={() => setFocusedField("from")}
                  onBlur={() => setTimeout(() => setFocusedField(null), 200)}
                  placeholder="Leaving from..."
                  className="w-full bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all duration-200"
                />

                {/* City suggestions dropdown */}
                {focusedField === "from" && suggestions.from.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl overflow-hidden z-10 border border-[rgba(255,255,255,0.08)]">
                    {suggestions.from.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, from: city }));
                          setSuggestions((f) => ({ ...f, from: [] }));
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.05] hover:text-white transition-colors"
                      >
                        📍 {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* To City */}
            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                <MapPinIcon className="w-4 h-4 text-amber-400" />
                To
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.to}
                  onChange={(e) => handleCityInput(e.target.value, "to")}
                  onFocus={() => setFocusedField("to")}
                  onBlur={() => setTimeout(() => setFocusedField(null), 200)}
                  placeholder="Going to..."
                  className="w-full bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all duration-200"
                />

                {/* Swap button */}
                <button
                  type="button"
                  onClick={swap}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/[0.03] border border-[rgba(255,255,255,0.08)] text-gray-400 hover:text-amber-400 hover:border-amber-500/30 transition-all duration-200"
                >
                  <ArrowsRightLeftIcon className="w-5 h-5" />
                </button>

                {/* City suggestions dropdown */}
                {focusedField === "to" && suggestions.to.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl overflow-hidden z-10 border border-[rgba(255,255,255,0.08)]">
                    {suggestions.to.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, to: city }));
                          setSuggestions((f) => ({ ...f, to: [] }));
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.05] hover:text-white transition-colors"
                      >
                        📍 {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                <CalendarIcon className="w-4 h-4 text-amber-400" />
                Date
              </label>
              <input
                type="date"
                value={form.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="w-full bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all duration-200 [color-scheme:dark]"
              />
            </div>

            {/* Seats */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                <UserGroupIcon className="w-4 h-4 text-amber-400" />
                Seats Needed
              </label>
              <select
                value={form.seats}
                onChange={(e) =>
                  setForm((f) => ({ ...f, seats: e.target.value }))
                }
                className="w-full bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all duration-200"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n} className="bg-[#111827]">
                    {n} seat{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Women Only Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, womenOnly: !f.womenOnly }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                form.womenOnly ? "bg-amber-500" : "bg-white/[0.08]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  form.womenOnly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <ShieldCheckIcon className="w-4 h-4 text-pink-400" />
              Women-only trips only
            </label>
          </div>

          {/* Search Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3.5 rounded-xl text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <SparklesIcon className="w-5 h-5" />
                </motion.div>
                Searching...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="w-5 h-5" />
                Search Trips
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Results Section */}
        <AnimatePresence>
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {trips.length > 0
                      ? `${trips.length} Trip${trips.length > 1 ? "s" : ""} Available`
                      : "No Trips Found"}
                  </h2>
                  {trips.length > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      {form.from}{" "}
                      <ArrowRightIcon className="inline w-3 h-3 mx-1" />{" "}
                      {form.to}
                    </p>
                  )}
                </div>
                {trips.length > 0 && (
                  <span className="text-xs text-gray-500 glass-card rounded-lg px-3 py-1.5">
                    Updated just now
                  </span>
                )}
              </div>

              {/* Trip Cards */}
              {trips.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 glass-card rounded-2xl"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-6xl mb-6"
                  >
                    🚗
                  </motion.div>
                  <p className="text-lg font-medium text-white mb-2">
                    No trips found on this route
                  </p>
                  <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                    Be the first to offer this route and earn money while
                    traveling.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/offer-trip")}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2 shadow-lg shadow-amber-500/25"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Offer a Trip
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {trips.map((trip, index) => (
                    <motion.div
                      key={trip._id}
                      variants={itemVariants}
                      custom={index}
                    >
                      <TripCard
                        trip={trip}
                        onBook={() => navigate(`/rideshare/${trip._id}`)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA for first-time visitors */}
        {!searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-8"
          >
            <p className="text-gray-400 text-sm mb-4">
              Driving somewhere? Offer seats and earn on your journey
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/offer-trip")}
              className="glass-card border-[rgba(255,255,255,0.12)] text-amber-400 font-semibold px-6 py-3 rounded-xl hover:border-amber-500/30 hover:text-amber-300 transition-all duration-200 inline-flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Offer a Trip
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Premium Trip Card Component - Amber Theme
function TripCard({ trip, onBook }) {
  const depDate = new Date(trip.departureDate);
  const isToday = depDate.toDateString() === new Date().toDateString();
  const isTomorrow =
    depDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

  const getDateLabel = () => {
    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";
    return depDate.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      onClick={onBook}
      className="glass-card rounded-2xl p-6 cursor-pointer group"
      whileHover={{
        boxShadow: "0 0 25px rgba(245, 158, 11, 0.15)",
      }}
    >
      <div className="flex items-start justify-between gap-6">
        {/* Left - Route Info */}
        <div className="flex-1 min-w-0">
          {/* Route Timeline */}
          <div className="flex items-center gap-4 mb-4">
            {/* Departure */}
            <div className="text-center flex-shrink-0">
              <p className="text-xl font-bold text-white font-mono">
                {trip.departureTime}
              </p>
              <p className="text-xs text-gray-400 mt-1 font-medium">
                {trip.fromCity}
              </p>
            </div>

            {/* Route Line */}
            <div className="flex-1 flex items-center px-2">
              <div className="flex-1 border-t border-[rgba(255,255,255,0.08)] relative">
                <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
              </div>
              <div className="px-3">
                <ClockIcon className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 border-t border-[rgba(255,255,255,0.08)] relative">
                <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center flex-shrink-0">
              <p className="text-xl font-bold text-white font-mono">
                {trip.estimatedArrival || "--:--"}
              </p>
              <p className="text-xs text-gray-400 mt-1 font-medium">
                {trip.toCity}
              </p>
            </div>
          </div>

          {/* Trip Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-[rgba(255,255,255,0.08)] text-xs text-gray-400">
              <CalendarIcon className="w-3 h-3 text-amber-400" />
              {getDateLabel()}
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-[rgba(255,255,255,0.08)] text-xs text-gray-400">
              <UserGroupIcon className="w-3 h-3 text-amber-400" />
              {trip.availableSeats} seat{trip.availableSeats !== 1 ? "s" : ""}{" "}
              left
            </span>

            {trip.womenOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-xs text-pink-400">
                <ShieldCheckIcon className="w-3 h-3" />
                Women only
              </span>
            )}

            {trip.instantBook && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                <BoltIcon className="w-3 h-3" />
                Instant book
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-[rgba(255,255,255,0.08)] text-xs text-gray-400 capitalize">
              {trip.luggageAllowed || "Medium"} luggage
            </span>

            {trip.driver?.rating && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                <StarIcon className="w-3 h-3" />
                {trip.driver.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Right - Price & Driver */}
        <div className="text-right flex-shrink-0">
          {/* Price */}
          <div className="mb-4">
            <p className="text-3xl font-bold text-white font-mono">
              ₹{trip.pricePerSeat?.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">per seat</p>
          </div>

          {/* Driver Info */}
          <div className="flex items-center gap-3 justify-end">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {trip.driver?.name || "Driver"}
              </p>
              <p className="text-xs text-gray-500">
                {trip.driver?.ridesCompleted || 0} rides
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-sm font-bold text-white ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/25">
              {trip.driver?.name?.[0]?.toUpperCase() || "D"}
            </div>
          </div>

          {/* View Details CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="inline-flex items-center gap-1 text-xs text-amber-400">
              View Details
              <ArrowRightIcon className="w-3 h-3" />
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
