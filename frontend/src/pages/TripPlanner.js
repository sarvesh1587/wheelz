import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowUpRight,
  Bike,
  Car,
  Check,
  Star,
  Sparkles as SparklesIcon,
  RefreshCw as ArrowPathIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
} from "lucide-react";
import { Reveal, Magnetic, EASE } from "../components/motion";
import { PageHeader, Segmented, StatusPill, Row } from "../components/ui";
import usePlatformStats from "../hooks/usePlatformStats";

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
    emoji: "",
  },
  {
    label: "Delhi → Manali",
    from: "Delhi",
    to: "Manali",
    days: 5,
    people: 4,
    emoji: "",
  },
  {
    label: "Bangalore → Coorg",
    from: "Bangalore",
    to: "Coorg",
    days: 2,
    people: 2,
    emoji: "",
  },
  {
    label: "Delhi → Jaipur",
    from: "Delhi",
    to: "Jaipur",
    days: 2,
    people: 3,
    emoji: "",
  },
  {
    label: "Chennai → Pondicherry",
    from: "Chennai",
    to: "Pondicherry",
    days: 2,
    people: 2,
    emoji: "",
  },
  {
    label: "Bangalore → Goa",
    from: "Bangalore",
    to: "Goa",
    days: 4,
    people: 4,
    emoji: "",
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
  const platform = usePlatformStats();
  // Trips start where we actually have vehicles; destinations can be anywhere.
  const PICKUP_CITIES = platform.cities.length ? platform.cities : INDIAN_CITIES;
  const popularTrips = POPULAR_TRIPS.filter((t) => !platform.ready || platform.cities.includes(t.from));
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
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader
        index="01"
        eyebrow="AI trip planner"
        title={["Plan the", "road trip."]}
        lede="Tell us where you're going. Wheelz AI picks the best vehicle, estimates costs, and pre-fills your booking."
      />

      {/* Popular Trips */}
      {popularTrips.length > 0 && (
      <Reveal className="mb-10">
        <p className="eyebrow mb-4">Popular routes</p>
        <div className="flex flex-wrap gap-2">
          {popularTrips.map((trip) => (
            <button key={trip.label} onClick={() => applyPopularTrip(trip)} className="chip">
              {trip.label}
            </button>
          ))}
        </div>
      </Reveal>
      )}

      {/* Main Form Card */}
      <Reveal delay={0.1} className="rounded-[28px] border border-line/10 bg-surface p-6 md:p-10">
        <Segmented
          value={mode}
          onChange={setMode}
          className="mb-10"
          options={[
            { value: "form", label: "Fill details" },
            { value: "text", label: "Describe in words" },
          ]}
        />

        {mode === "text" ? (
          <div>
            <label className="field-label">Describe your trip in plain English</label>
            <textarea
              rows={3}
              value={tripText}
              onChange={(e) => setTripText(e.target.value)}
              placeholder='e.g., "3-day Goa trip from Mumbai with 2 friends, budget ₹8000, need automatic car"'
              className="field display-tight resize-none !text-2xl"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "3-day Goa trip from Mumbai with 2 friends",
                "Weekend Manali trip for 4 people with SUV",
                "Coorg trip from Bangalore, budget ₹5000",
              ].map((ex) => (
                <button key={ex} onClick={() => setTripText(ex)} className="chip">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="field-label">From</label>
              <select name="from" value={form.from} onChange={handleFormChange} className="field display-tight !text-xl [&>option]:bg-surface">
                <option value="">Select city</option>
                {PICKUP_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">To</label>
              <select name="to" value={form.to} onChange={handleFormChange} className="field display-tight !text-xl [&>option]:bg-surface">
                <option value="">Select destination</option>
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Vehicle preference</label>
              <select name="preferredCategory" value={form.preferredCategory} onChange={handleFormChange} className="field [&>option]:bg-surface">
                <option value="">No preference</option>
                <option value="car">Car / SUV</option>
                <option value="bike">Bike / Scooter</option>
              </select>
            </div>
            <div>
              <label className="field-label">Days</label>
              <input type="number" name="days" min={1} max={30} value={form.days} onChange={handleFormChange} className="field" />
            </div>
            <div>
              <label className="field-label">People</label>
              <input type="number" name="people" min={1} max={10} value={form.people} onChange={handleFormChange} className="field" />
            </div>
            <div>
              <label className="field-label">Total budget (optional)</label>
              <input type="number" name="budget" placeholder="e.g., 10000" value={form.budget} onChange={handleFormChange} className="field" />
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-2 lg:col-span-3">
              {[
                ["roundTrip", "Round trip"],
                ["needDriver", "Need a driver (+₹700/day)"],
              ].map(([name, label]) => (
                <label
                  key={name}
                  className={`chip cursor-pointer ${form[name] ? "!border-accent !bg-accent !text-accent-ink" : ""}`}
                >
                  <input type="checkbox" name={name} checked={form[name]} onChange={handleFormChange} className="sr-only" />
                  {form[name] && <Check size={13} />} {label}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-end border-t border-line/10 pt-6">
          <Magnetic strength={0.2}>
            <button onClick={handlePlan} disabled={loading} className="btn-primary !px-8 !py-4">
              {loading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" /> Planning your trip…
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4" /> Plan my trip
                </>
              )}
            </button>
          </Magnetic>
        </div>
      </Reveal>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.section
            id="trip-results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="mt-24"
          >
            {/* Trip Summary */}
            <div className="mb-12 border-b border-line/10 pb-10">
              <p className="eyebrow mb-6 flex items-center gap-3"><span className="text-accent">(02)</span> Your plan</p>
              <h2 className="display text-5xl md:text-7xl">
                {result.tripParams.from} <span className="text-accent">→</span> {result.tripParams.to}
              </h2>
              <p className="mt-6 max-w-2xl text-muted">{result.tripSummary}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="chip">{result.tripParams.days} days</span>
                <span className="chip">{result.tripParams.people} people</span>
                <span className="chip">~{result.plans[0]?.tripDetails?.distance || "—"} km</span>
                {result.tripParams.roundTrip && <span className="chip">Round trip</span>}
              </div>
            </div>

            <p className="eyebrow mb-6">
              Recommended vehicles · {String(result.plans.length).padStart(2, "0")} options
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

// Vehicle Plan Card Component
function VehiclePlanCard({ plan, isTop, tripParams, onBook }) {
  const [expanded, setExpanded] = useState(false);
  const { vehicle, costBreakdown, suitabilityLabel, suitabilityScore } = plan;

  const scoreTone = suitabilityScore >= 95 ? "positive" : suitabilityScore >= 88 ? "pending" : "neutral";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className={`relative overflow-hidden rounded-[24px] border bg-surface ${isTop ? "border-accent" : "border-line/10"}`}
    >
      <div className="relative aspect-[16/9] bg-raised">
        {vehicle.images?.[0] ? (
          <img src={vehicle.images[0]} alt={vehicle.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted">
            {vehicle.category === "bike" ? <Bike size={32} strokeWidth={1.25} /> : <Car size={32} strokeWidth={1.25} />}
          </div>
        )}
        {isTop && (
          <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-ink">
            AI top pick
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4 className="display-tight text-2xl">{vehicle.name}</h4>
            <p className="mt-1 text-xs capitalize text-muted">
              {vehicle.fuelType} · {vehicle.transmission} ·{" "}
              {vehicle.seats || (vehicle.category === "bike" ? 2 : 5)} seats
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <Star size={12} className="fill-accent text-accent" />
              {vehicle.rating?.toFixed(1) || "New"} · ₹{vehicle.basePrice?.toLocaleString()}/day
            </p>
          </div>
          <StatusPill tone={scoreTone}>{suitabilityLabel}</StatusPill>
        </div>

        <div className="mt-6 flex items-end justify-between border-t border-line/10 pt-5">
          <div>
            <p className="eyebrow">Total trip cost</p>
            <p className="display mt-2 text-4xl">₹{costBreakdown.totalCost.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="eyebrow">Per person</p>
            <p className="mt-2 font-mono text-sm">₹{costBreakdown.costPerPerson.toLocaleString()}</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="link-underline mt-4 inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
        >
          {expanded ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
          {expanded ? "Hide breakdown" : "See cost breakdown"}
        </button>
        {expanded && (
          <div className="mt-3">
            {[
              [
                "Rental",
                `₹${costBreakdown.rentalCost.toLocaleString()}`,
                `₹${vehicle.basePrice}/day × ${tripParams.days} days`,
              ],
              [
                "Fuel",
                `₹${costBreakdown.fuelCost.toLocaleString()}`,
                `~${plan.tripDetails.totalKm}km total`,
              ],
              [
                "Tolls (est.)",
                `₹${costBreakdown.tollsEstimate.toLocaleString()}`,
                "approximate",
              ],
              ...(costBreakdown.driverCost > 0
                ? [
                    [
                      "Driver",
                      `₹${costBreakdown.driverCost.toLocaleString()}`,
                      `₹700/day × ${tripParams.days} days`,
                    ],
                  ]
                : []),
            ].map(([label, amount, note]) => (
              <Row key={label} label={`${label} (${note})`}>
                {amount}
              </Row>
            ))}
            <Row label="Total" strong>
              ₹{costBreakdown.totalCost.toLocaleString()}
            </Row>
          </div>
        )}

        <button onClick={onBook} className={`${isTop ? "btn-primary" : "btn-ghost"} mt-6 w-full`}>
          Book this vehicle <ArrowUpRight size={16} />
        </button>
      </div>
    </motion.article>
  );
}
