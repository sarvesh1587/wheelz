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
  const [debug, setDebug] = useState(null);

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
    if (!form.from || !form.to) {
      toast.error("Please select From and To cities");
      return;
    }

    setLoading(true);
    setSearched(true);
    setDebug(null);

    try {
      const params = new URLSearchParams();
      params.append("from", form.from);
      params.append("to", form.to);
      if (form.date) params.append("date", form.date);
      if (form.seats) params.append("seats", form.seats);
      if (form.womenOnly) params.append("womenOnly", "true");

      console.log("🔍 Searching with params:", params.toString());

      const res = await axios.get(`${API}/rideshare/search`, { params });

      console.log("📋 API Response:", res.data);
      console.log("📋 Trips array:", res.data.trips);
      console.log("📋 Number of trips:", res.data.trips?.length);

      if (res.data.trips && res.data.trips.length > 0) {
        console.log("📋 First trip details:", {
          id: res.data.trips[0]._id,
          from: res.data.trips[0].fromCity,
          to: res.data.trips[0].toCity,
          departureDate: res.data.trips[0].departureDate,
          price: res.data.trips[0].pricePerSeat,
          seats: res.data.trips[0].availableSeats,
        });
        setDebug({
          count: res.data.trips.length,
          sample: res.data.trips[0],
        });
      }

      setTrips(res.data.trips || []);

      if (res.data.trips?.length === 0) {
        toast.info("No trips found. Try different cities or dates.");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(
        error.response?.data?.message || "Search failed. Please try again.",
      );
      setDebug({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const swap = () => {
    setForm((f) => ({ ...f, from: f.to, to: f.from }));
    toast.success("Routes swapped", { icon: "🔄" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-8">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4 animate-pulse" />
              Premium Ridesharing
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Find Your </span>
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                Perfect Ride
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-lg mx-auto">
              Connect with verified drivers. Split costs. Travel sustainably.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 pb-16">
        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSearch}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                <MapPinIcon className="w-4 h-4 inline mr-1 text-amber-400" />
                From
              </label>
              <input
                type="text"
                value={form.from}
                onChange={(e) => handleCityInput(e.target.value, "from")}
                onFocus={() => setFocusedField("from")}
                onBlur={() => setTimeout(() => setFocusedField(null), 200)}
                placeholder="Mumbai"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
              />
              {focusedField === "from" && suggestions.from.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl overflow-hidden z-10 border border-gray-700">
                  {suggestions.from.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, from: city }));
                        setSuggestions((f) => ({ ...f, from: [] }));
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      📍 {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                <MapPinIcon className="w-4 h-4 inline mr-1 text-amber-400" />
                To
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.to}
                  onChange={(e) => handleCityInput(e.target.value, "to")}
                  onFocus={() => setFocusedField("to")}
                  onBlur={() => setTimeout(() => setFocusedField(null), 200)}
                  placeholder="Goa"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="button"
                  onClick={swap}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-amber-400"
                >
                  <ArrowsRightLeftIcon className="w-4 h-4" />
                </button>
              </div>
              {focusedField === "to" && suggestions.to.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl overflow-hidden z-10 border border-gray-700">
                  {suggestions.to.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, to: city }));
                        setSuggestions((f) => ({ ...f, to: [] }));
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      📍 {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                <CalendarIcon className="w-4 h-4 inline mr-1 text-amber-400" />
                Date
              </label>
              <input
                type="date"
                value={form.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                <UserGroupIcon className="w-4 h-4 inline mr-1 text-amber-400" />
                Seats Needed
              </label>
              <select
                value={form.seats}
                onChange={(e) =>
                  setForm((f) => ({ ...f, seats: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} seat{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, womenOnly: !f.womenOnly }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.womenOnly ? "bg-amber-500" : "bg-white/20"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.womenOnly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <label className="text-sm text-gray-400 cursor-pointer">
              <ShieldCheckIcon className="w-4 h-4 inline mr-1 text-pink-400" />
              Women-only trips only
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                Searching...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="w-5 h-5" /> Search Trips
              </>
            )}
          </button>
        </motion.form>

        {/* Debug Info - Remove after testing */}
        {debug && (
          <div className="mb-4 p-3 bg-gray-800/50 rounded-lg text-xs">
            <p className="text-gray-400">
              Debug:{" "}
              {debug.count
                ? `${debug.count} trips found`
                : debug.error || "No trips"}
            </p>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {trips.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-6xl mb-4">🚗</div>
                  <p className="text-lg font-medium text-white mb-2">
                    No trips found
                  </p>
                  <p className="text-sm text-gray-400 mb-6">
                    Try different cities or dates
                  </p>
                  <button
                    onClick={() => navigate("/offer-trip")}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl inline-flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" /> Offer a Trip
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {trips.map((trip) => (
                    <TripCard
                      key={trip._id}
                      trip={trip}
                      onBook={() => navigate(`/rideshare/${trip._id}`)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Trip Card Component
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

  // Safety check - if trip data is incomplete
  if (!trip || !trip.fromCity) {
    return null;
  }

  return (
    <div
      onClick={onBook}
      className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 cursor-pointer hover:bg-white/10 transition-all border border-white/10"
    >
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div className="flex-1">
          {/* Route */}
          <div className="flex items-center gap-2 mb-3">
            <MapPinIcon className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">{trip.fromCity}</span>
            <ArrowRightIcon className="w-4 h-4 text-gray-500" />
            <MapPinIcon className="w-4 h-4 text-green-400" />
            <span className="font-semibold text-white">{trip.toCity}</span>
          </div>

          {/* Details */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" /> {getDateLabel()} at{" "}
              {trip.departureTime || "10:00"}
            </span>
            <span className="flex items-center gap-1">
              <UserGroupIcon className="w-3 h-3" /> {trip.availableSeats} seats
              left
            </span>
            {trip.womenOnly && (
              <span className="flex items-center gap-1 text-pink-400">
                <ShieldCheckIcon className="w-3 h-3" /> Women only
              </span>
            )}
          </div>

          {/* Driver */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {trip.driver?.name?.[0]?.toUpperCase() || "D"}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {trip.driver?.name || "Driver"}
              </p>
              <p className="text-xs text-gray-500">
                {trip.driver?.ridesCompleted || 0} rides
              </p>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="text-right">
          <p className="text-2xl font-bold text-amber-400">
            ₹{trip.pricePerSeat?.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">per seat</p>
          <button className="mt-2 px-4 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
