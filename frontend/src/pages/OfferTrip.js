/**
 * OfferTrip Page — Driver creates a shared trip listing
 * File: frontend/src/pages/OfferTrip.js
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

export default function OfferTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fromCity: "",
    toCity: "",
    fromAddress: "",
    toAddress: "",
    departureDate: "",
    departureTime: "",
    estimatedDuration: "",
    totalSeats: 1,
    pricePerSeat: "",
    useAutoPrice: true,
    womenOnly: false,
    luggageAllowed: "medium",
    smokingAllowed: false,
    petsAllowed: false,
    acAvailable: true,
    instantBook: false,
    isRecurring: false,
    recurringDays: [],
    vehicleName: "",
    vehicleBrand: "",
    disclaimerAccepted: false,
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const estimateAutoPrice = () => {
    if (!form.fromCity || !form.toCity || !form.totalSeats) return;
    set("useAutoPrice", true);
    toast.success("Auto price will be calculated when you submit");
  };

  const handleSubmit = async () => {
    if (!form.disclaimerAccepted) {
      return toast.error("Please accept the disclaimer to continue");
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("wheelz_token");
      const res = await axios.post(`${API}/rideshare`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success("Trip listed successfully! 🎉");
        navigate(`/rideshare/${res.data.trip._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500";
  const labelCls =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-10">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">Offer a Shared Trip</h1>
          <p className="text-green-100">
            Share your journey, split costs, meet new people
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {["Route", "Schedule", "Preferences", "Review"].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-2 ${i + 1 === step ? "text-green-600 dark:text-green-400" : i + 1 < step ? "text-gray-400" : "text-gray-300 dark:text-gray-600"}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i + 1 === step ? "border-green-600 bg-green-600 text-white" : i + 1 < step ? "border-gray-400 bg-gray-400 text-white" : "border-gray-300 dark:border-gray-700"}`}
                >
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s}</span>
              </div>
              {i < 3 && (
                <div
                  className={`flex-1 h-0.5 ${i + 1 < step ? "bg-gray-400" : "bg-gray-200 dark:bg-gray-700"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          {/* Step 1 — Route */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                📍 Where are you going?
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>From City</label>
                  <select
                    value={form.fromCity}
                    onChange={(e) => set("fromCity", e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select city</option>
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>To City</label>
                  <select
                    value={form.toCity}
                    onChange={(e) => set("toCity", e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select city</option>
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  Pickup Point{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="e.g. Andheri Station, Gate 2"
                  value={form.fromAddress}
                  onChange={(e) => set("fromAddress", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Drop Point{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="e.g. Panaji Bus Stand"
                  value={form.toAddress}
                  onChange={(e) => set("toAddress", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Vehicle Name</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Swift Dzire"
                    value={form.vehicleName}
                    onChange={(e) => set("vehicleName", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Brand</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Maruti"
                    value={form.vehicleBrand}
                    onChange={(e) => set("vehicleBrand", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Schedule */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                📅 When are you leaving?
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Departure Date</label>
                  <input
                    type="date"
                    className={inputCls}
                    min={new Date().toISOString().split("T")[0]}
                    value={form.departureDate}
                    onChange={(e) => set("departureDate", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Departure Time</label>
                  <input
                    type="time"
                    className={inputCls}
                    value={form.departureTime}
                    onChange={(e) => set("departureTime", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Estimated Duration</label>
                <input
                  className={inputCls}
                  placeholder="e.g. 8 hours"
                  value={form.estimatedDuration}
                  onChange={(e) => set("estimatedDuration", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Available Seats</label>
                <select
                  value={form.totalSeats}
                  onChange={(e) => set("totalSeats", parseInt(e.target.value))}
                  className={inputCls}
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} seat{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              {/* Pricing */}
              <div>
                <label className={labelCls}>Price Per Seat (₹)</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={estimateAutoPrice}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${form.useAutoPrice ? "bg-green-600 text-white border-green-600" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"}`}
                  >
                    🤖 Auto Calculate
                  </button>
                  <button
                    type="button"
                    onClick={() => set("useAutoPrice", false)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${!form.useAutoPrice ? "bg-green-600 text-white border-green-600" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"}`}
                  >
                    ✏️ Set Manually
                  </button>
                </div>
                {!form.useAutoPrice && (
                  <input
                    type="number"
                    className={`${inputCls} mt-3`}
                    placeholder="Enter price per seat"
                    value={form.pricePerSeat}
                    onChange={(e) => set("pricePerSeat", e.target.value)}
                  />
                )}
                {form.useAutoPrice && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ✅ Fair cost-share price will be auto-calculated based on
                    fuel cost & distance
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3 — Preferences */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                ⚙️ Trip Preferences
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    key: "womenOnly",
                    label: "👩 Women only",
                    desc: "Only female passengers",
                  },
                  {
                    key: "instantBook",
                    label: "⚡ Instant book",
                    desc: "Auto-approve requests",
                  },
                  {
                    key: "acAvailable",
                    label: "❄️ AC available",
                    desc: "Vehicle has AC",
                  },
                  {
                    key: "smokingAllowed",
                    label: "🚬 Smoking allowed",
                    desc: "Smoking permitted",
                  },
                  {
                    key: "petsAllowed",
                    label: "🐾 Pets allowed",
                    desc: "Pet-friendly trip",
                  },
                ].map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form[opt.key] ? "border-green-400 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-700"}`}
                  >
                    <input
                      type="checkbox"
                      checked={!!form[opt.key]}
                      onChange={(e) => set(opt.key, e.target.checked)}
                      className="mt-0.5 accent-green-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div>
                <label className={labelCls}>Luggage Space</label>
                <select
                  value={form.luggageAllowed}
                  onChange={(e) => set("luggageAllowed", e.target.value)}
                  className={inputCls}
                >
                  <option value="none">None</option>
                  <option value="small">Small (backpack)</option>
                  <option value="medium">Medium (cabin bag)</option>
                  <option value="large">Large (check-in bag)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4 — Review + Disclaimer */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                ✅ Review & Confirm
              </h2>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
                {[
                  ["Route", `${form.fromCity} → ${form.toCity}`],
                  ["Date", `${form.departureDate} at ${form.departureTime}`],
                  ["Duration", form.estimatedDuration || "Not set"],
                  ["Seats", form.totalSeats],
                  [
                    "Price",
                    form.useAutoPrice
                      ? "Auto-calculated"
                      : `₹${form.pricePerSeat}/seat`,
                  ],
                  ["Women only", form.womenOnly ? "Yes" : "No"],
                  ["Instant book", form.instantBook ? "Yes" : "No"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      {k}
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                  ⚠️ Important Disclaimer
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  By offering this trip, you confirm that this is a{" "}
                  <strong>cost-sharing arrangement</strong> and not a commercial
                  transport service. You are not profiting from passengers — you
                  are sharing fuel and toll costs only. Please verify that your
                  vehicle insurance permits paid passengers. Wheelz is not
                  responsible for accidents, disputes, or legal issues arising
                  from shared trips.
                </p>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.disclaimerAccepted}
                    onChange={(e) =>
                      set("disclaimerAccepted", e.target.checked)
                    }
                    className="accent-amber-600"
                  />
                  <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    I understand and accept these terms
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                ← Back
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !form.disclaimerAccepted}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">🔄</span> Creating...
                  </>
                ) : (
                  "🚗 List My Trip"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
