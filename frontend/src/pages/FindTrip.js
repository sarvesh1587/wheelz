/**
 * FindTrip Page — Wheelz Rideshare Search
 * File: frontend/src/pages/FindTrip.js
 */

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeftRight, ArrowRight, ArrowUpRight, Plus, Search, ShieldCheck } from "lucide-react";
import { Reveal, Magnetic } from "../components/motion";
import { PageHeader, Empty, Spinner } from "../components/ui";

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

    try {
      // Search is public; send the token only when the user is signed in.
      const token = localStorage.getItem("wheelz_token");
      const params = new URLSearchParams();
      params.append("from", form.from.trim());
      params.append("to", form.to.trim());
      if (form.date) params.append("date", form.date);
      if (form.seats) params.append("seats", form.seats);
      if (form.womenOnly) params.append("womenOnly", "true");

      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const res = await axios.get(`${API}/rideshare/search`, {
        params,
        ...config,
      });

      if (res.data.success) {
        setTrips(res.data.trips || []);
        if (res.data.trips?.length === 0) {
          toast("No trips found. Try different cities or dates.");
        }
      } else {
        toast.error(res.data.message || "Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);

      // Handle 401 specifically
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("wheelz_token");
        localStorage.removeItem("wheelz_user");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message || "Search failed. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const swap = () => {
    setForm((f) => ({ ...f, from: f.to, to: f.from }));
    toast.success("Routes swapped", { icon: "" });
  };

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader
        index="01"
        eyebrow="Ridesharing"
        title={["Find a", "shared ride."]}
        lede="Connect with verified drivers. Split costs. Travel sustainably."
        actions={
          <Link to="/offer-trip" className="btn-ghost">
            <Plus size={16} /> Offer a trip
          </Link>
        }
      />

      {/* Search Form */}
      <Reveal as="form" onSubmit={handleSearch} className="mb-16 rounded-[28px] border border-line/10 bg-surface p-6 md:p-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12">
          <div className="relative lg:col-span-4">
            <label className="field-label">From</label>
            <input
              type="text"
              value={form.from}
              onChange={(e) => handleCityInput(e.target.value, "from")}
              onFocus={() => setFocusedField("from")}
              onBlur={() => setTimeout(() => setFocusedField(null), 200)}
              placeholder="Mumbai"
              className="field display-tight !text-2xl"
            />
            {focusedField === "from" && suggestions.from.length > 0 && (
              <CitySuggestions
                cities={suggestions.from}
                onPick={(city) => {
                  setForm((f) => ({ ...f, from: city }));
                  setSuggestions((f) => ({ ...f, from: [] }));
                }}
              />
            )}
          </div>

          <div className="relative lg:col-span-4">
            <label className="field-label">To</label>
            <div className="relative">
              <input
                type="text"
                value={form.to}
                onChange={(e) => handleCityInput(e.target.value, "to")}
                onFocus={() => setFocusedField("to")}
                onBlur={() => setTimeout(() => setFocusedField(null), 200)}
                placeholder="Goa"
                className="field display-tight !pr-12 !text-2xl"
              />
              <button
                type="button"
                onClick={swap}
                aria-label="Swap cities"
                className="absolute right-0 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line/15 text-muted transition-colors hover:border-ink hover:text-ink"
              >
                <ArrowLeftRight size={14} />
              </button>
            </div>
            {focusedField === "to" && suggestions.to.length > 0 && (
              <CitySuggestions
                cities={suggestions.to}
                onPick={(city) => {
                  setForm((f) => ({ ...f, to: city }));
                  setSuggestions((f) => ({ ...f, to: [] }));
                }}
              />
            )}
          </div>

          <div className="lg:col-span-2">
            <label className="field-label">Date</label>
            <input
              type="date"
              value={form.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setForm((f) => ({ ...f, date: e.target.value }))
              }
              className="field [color-scheme:inherit]"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="field-label">Seats</label>
            <select
              value={form.seats}
              onChange={(e) =>
                setForm((f) => ({ ...f, seats: e.target.value }))
              }
              className="field [&>option]:bg-surface"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} seat{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-line/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-muted">
            <button
              type="button"
              role="switch"
              aria-checked={form.womenOnly}
              onClick={() =>
                setForm((f) => ({ ...f, womenOnly: !f.womenOnly }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
                form.womenOnly ? "border-accent bg-accent" : "border-line/20 bg-transparent"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                  form.womenOnly ? "translate-x-6 bg-accent-ink" : "translate-x-1 bg-muted"
                }`}
              />
            </button>
            <ShieldCheck size={14} className="text-accent" />
            Women-only trips only
          </label>

          <Magnetic strength={0.2}>
            <button type="submit" disabled={loading} className="btn-primary !px-8 !py-4">
              {loading ? (
                <>
                  <Spinner /> Searching…
                </>
              ) : (
                <>
                  <Search size={16} /> Search trips
                </>
              )}
            </button>
          </Magnetic>
        </div>
      </Reveal>

      {/* Debug Info - Remove after testing */}
      {debug && (
        <p className="mb-4 font-mono text-xs text-muted">
          Debug:{" "}
          {debug.count
            ? `${debug.count} trips found`
            : debug.error || "No trips"}
        </p>
      )}

      {/* Results */}
      <AnimatePresence>
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {trips.length === 0 ? (
              <Empty
                title="No trips found."
                action={
                  <button onClick={() => navigate("/offer-trip")} className="btn-primary">
                    <Plus size={16} /> Offer a trip
                  </button>
                }
              >
                Try different cities or dates.
              </Empty>
            ) : (
              <>
                <p className="eyebrow mb-4">
                  {String(trips.length).padStart(2, "0")} trip{trips.length !== 1 ? "s" : ""} found
                </p>
                <div className="border-t border-line/10">
                  {trips.map((trip) => (
                    <TripCard
                      key={trip._id}
                      trip={trip}
                      onBook={() => navigate(`/rideshare/${trip._id}`)}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CitySuggestions({ cities, onPick }) {
  return (
    <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-line/10 bg-surface p-1.5 shadow-2xl" data-lenis-prevent>
      {cities.map((city) => (
        <button
          key={city}
          type="button"
          onClick={() => onPick(city)}
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-raised"
        >
          {city}
        </button>
      ))}
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
    <button
      type="button"
      onClick={onBook}
      className="group grid w-full gap-6 border-b border-line/10 py-8 text-left transition-colors md:grid-cols-12 md:items-center"
    >
      <div className="md:col-span-6">
        <p className="eyebrow mb-3">
          {getDateLabel()} · {trip.departureTime || "10:00"}
        </p>
        <h3 className="display-tight flex flex-wrap items-center gap-3 text-3xl md:text-4xl">
          <span>{trip.fromCity}</span>
          <ArrowRight size={24} className="text-accent transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
          <span>{trip.toCity}</span>
        </h3>
      </div>

      <div className="flex items-center gap-3 md:col-span-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-raised text-sm font-semibold">
          {trip.driver?.name?.[0]?.toUpperCase() || "D"}
        </span>
        <div>
          <p className="text-sm font-medium">{trip.driver?.name || "Driver"}</p>
          <p className="text-xs text-muted">
            {trip.driver?.ridesCompleted || 0} rides · {trip.availableSeats} seats left
          </p>
          {trip.womenOnly && (
            <p className="mt-1 flex items-center gap-1 text-xs text-accent">
              <ShieldCheck size={12} /> Women only
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 md:col-span-3 md:justify-end">
        <div className="md:text-right">
          <p className="display text-3xl">₹{trip.pricePerSeat?.toLocaleString()}</p>
          <p className="eyebrow mt-1">per seat</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-full border border-line/15 transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-ink">
          <ArrowUpRight size={16} />
        </span>
      </div>
    </button>
  );
}
