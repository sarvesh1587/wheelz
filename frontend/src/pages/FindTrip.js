/**
 * FindTrip Page — BlaBlaCar-style search
 * File: frontend/src/pages/FindTrip.js
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!form.from || !form.to)
      return toast.error("Please select From and To cities");
    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.get(`${API}/rideshare/search`, {
        params: {
          from: form.from,
          to: form.to,
          date: form.date,
          seats: form.seats,
          womenOnly: form.womenOnly,
        },
      });
      setTrips(res.data.trips || []);
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const swap = () => setForm((f) => ({ ...f, from: f.to, to: f.from }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            🚗 BlaBlaCar-style Ride Sharing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Find a Shared Trip
          </h1>
          <p className="text-green-100 text-lg max-w-lg mx-auto">
            Travel together, split costs. Safe, affordable, community-driven.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                📍 From
              </label>
              <select
                value={form.from}
                onChange={(e) =>
                  setForm((f) => ({ ...f, from: e.target.value }))
                }
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Leaving from...</option>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Swap button */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                🏁 To
              </label>
              <select
                value={form.to}
                onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Going to...</option>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={swap}
                className="absolute right-12 top-7 text-gray-400 hover:text-green-500 text-lg transition-colors"
              >
                ⇄
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                📅 Date
              </label>
              <input
                type="date"
                value={form.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                👥 Seats Needed
              </label>
              <select
                value={form.seats}
                onChange={(e) =>
                  setForm((f) => ({ ...f, seats: e.target.value }))
                }
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} seat{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.womenOnly}
                onChange={(e) =>
                  setForm((f) => ({ ...f, womenOnly: e.target.checked }))
                }
                className="rounded accent-green-600"
              />
              👩 Women-only trips only
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3.5 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">🔄</span> Searching...
              </>
            ) : (
              "🔍 Search Trips"
            )}
          </button>
        </form>

        {/* Results */}
        {searched && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {trips.length > 0
                  ? `${trips.length} trip${trips.length > 1 ? "s" : ""} found`
                  : "No trips found"}
              </h2>
              {trips.length > 0 && (
                <p className="text-sm text-gray-500">
                  {form.from} → {form.to}
                </p>
              )}
            </div>

            {trips.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="text-5xl mb-4">🚗</div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  No trips found
                </p>
                <p className="text-sm text-gray-500 mt-1 mb-6">
                  Be the first to offer this route!
                </p>
                <button
                  onClick={() => navigate("/offer-trip")}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  + Offer a Trip
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
          </div>
        )}

        {/* CTA when not searched yet */}
        {!searched && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Are you driving? Offer seats on your trip
            </p>
            <button
              onClick={() => navigate("/offer-trip")}
              className="border border-green-600 text-green-600 dark:text-green-400 font-semibold px-6 py-2.5 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              + Offer a Trip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TripCard({ trip, onBook }) {
  const depDate = new Date(trip.departureDate);
  return (
    <div
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onBook}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Route */}
          <div className="flex items-center gap-3 mb-3">
            <div className="text-center">
              <p className="font-bold text-gray-900 dark:text-white">
                {trip.departureTime}
              </p>
              <p className="text-sm text-gray-500">{trip.fromCity}</p>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 border-t-2 border-dashed border-gray-200 dark:border-gray-700" />
              <span className="text-xs text-gray-400">
                {trip.estimatedDuration || "~"}
              </span>
              <div className="flex-1 border-t-2 border-dashed border-gray-200 dark:border-gray-700" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 dark:text-white">
                {trip.estimatedArrival || "—"}
              </p>
              <p className="text-sm text-gray-500">{trip.toCity}</p>
            </div>
          </div>

          {/* Date + badges */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg">
              📅 {depDate.toDateString()}
            </span>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg">
              💺 {trip.availableSeats} seat
              {trip.availableSeats !== 1 ? "s" : ""} left
            </span>
            {trip.womenOnly && (
              <span className="bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 px-2 py-1 rounded-lg border border-pink-100 dark:border-pink-800">
                👩 Women only
              </span>
            )}
            {trip.instantBook && (
              <span className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-lg">
                ⚡ Instant book
              </span>
            )}
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg capitalize">
              {trip.luggageAllowed} luggage
            </span>
          </div>
        </div>

        {/* Driver + Price */}
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ₹{trip.pricePerSeat?.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mb-3">per seat</p>

          <div className="flex items-center gap-2 justify-end">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {trip.driver?.name?.[0]?.toUpperCase() || "D"}
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {trip.driver?.name?.split(" ")[0]}
              </p>
              <p className="text-xs text-gray-400">
                {trip.driver?.ridesCompleted || 0} rides
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
