import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { rideShareAPI, bookingAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  SparklesIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function OfferTrip() {
  const navigate = useNavigate();
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    bookingId: "",
    from: "",
    to: "",
    departureDate: "",
    departureTime: "",
    totalSeats: 2,
    pricePerSeat: "",
    womenOnly: false,
    allowPets: false,
    musicPreference: "conversation",
    luggageSpace: "medium",
  });

  useEffect(() => {
    fetchConfirmedBookings();
  }, []);

  const fetchConfirmedBookings = async () => {
    try {
      const res = await bookingAPI.getAll();
      const confirmed = (res.data.bookings || []).filter(
        (booking) =>
          booking.status === "confirmed" && booking.paymentStatus === "paid",
      );
      setConfirmedBookings(confirmed);
      if (confirmed.length === 0) {
        toast.error("You need a confirmed booking before you can offer a trip");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const calculateAutoPrice = () => {
    if (formData.from && formData.to && formData.totalSeats) {
      const basePrice = 200;
      const estimatedPrice = Math.ceil((basePrice * 2) / formData.totalSeats);
      setFormData({ ...formData, pricePerSeat: estimatedPrice });
      toast.success(`Suggested price: ₹${estimatedPrice} per seat`);
    } else {
      toast.error("Please enter route details first");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookingId) {
      toast.error("Please select a confirmed booking");
      return;
    }
    if (!formData.from || !formData.to) {
      toast.error("Please enter departure and destination cities");
      return;
    }
    if (!formData.departureDate) {
      toast.error("Please select departure date");
      return;
    }

    try {
      await rideShareAPI.create({
        bookingId: formData.bookingId,
        fromCity: formData.from, // ✅ renamed
        toCity: formData.to, // ✅ renamed
        departureDate: formData.departureDate, // ✅ separate field
        departureTime: formData.departureTime || "10:00", // ✅ separate field
        totalSeats: formData.totalSeats,
        pricePerSeat: formData.pricePerSeat || null,
        useAutoPrice: !formData.pricePerSeat,
        womenOnly: formData.womenOnly,
        petsAllowed: formData.allowPets, // ✅ renamed
        luggageAllowed: formData.luggageSpace, // ✅ renamed
        disclaimerAccepted: true, // ✅ added
      });
      toast.success("Trip offered successfully! 🎉");
      navigate("/dashboard");
    } catch (error) {
      console.error("Offer trip error:", error);
      toast.error(error.response?.data?.message || "Failed to offer trip");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <SparklesIcon className="w-4 h-4 animate-pulse" /> Share Your
            Journey
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Offer a Trip
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
            Share empty seats from your confirmed booking and earn back rental
            cost
          </p>
        </motion.div>

        {confirmedBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 p-8 text-center"
          >
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Confirmed Bookings
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You need to book and confirm a vehicle before you can offer shared
              trips.
            </p>
            <button
              onClick={() => navigate("/vehicles")}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Book a Vehicle First
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Your Confirmed Booking *
                </label>
                <select
                  value={formData.bookingId}
                  onChange={(e) =>
                    setFormData({ ...formData, bookingId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="">Select a confirmed booking</option>
                  {confirmedBookings.map((booking) => (
                    <option key={booking._id} value={booking._id}>
                      🚗 {booking.vehicle?.name} - {booking.pickupLocation} (
                      {new Date(booking.startDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <ShieldCheckIcon className="w-3 h-3" /> Only confirmed
                  bookings can be shared
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    From *
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.from}
                      onChange={(e) =>
                        setFormData({ ...formData, from: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500"
                      placeholder="Mumbai"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">To *</label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.to}
                      onChange={(e) =>
                        setFormData({ ...formData, to: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500"
                      placeholder="Goa"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Departure Date *
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          departureDate: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        departureTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Total Seats *
                  </label>
                  <div className="relative">
                    <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={formData.totalSeats}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalSeats: parseInt(e.target.value),
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price per Seat (₹)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <CurrencyRupeeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.pricePerSeat}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pricePerSeat: parseInt(e.target.value),
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500"
                        placeholder="Auto"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={calculateAutoPrice}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm hover:bg-amber-100 transition-colors"
                    >
                      Auto
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Travel Preferences
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.womenOnly}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          womenOnly: e.target.checked,
                        })
                      }
                      className="rounded text-amber-500"
                    />
                    <span className="text-sm">👩 Women only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowPets}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowPets: e.target.checked,
                        })
                      }
                      className="rounded text-amber-500"
                    />
                    <span className="text-sm">🐾 Pets allowed</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.musicPreference}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        musicPreference: e.target.value,
                      })
                    }
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                  >
                    <option value="silence">🔇 Silence preferred</option>
                    <option value="conversation">💬 Conversation</option>
                    <option value="music">🎵 Music</option>
                  </select>
                  <select
                    value={formData.luggageSpace}
                    onChange={(e) =>
                      setFormData({ ...formData, luggageSpace: e.target.value })
                    }
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                  >
                    <option value="none">No luggage space</option>
                    <option value="small">👜 Small (backpack)</option>
                    <option value="medium">💼 Medium (1 suitcase)</option>
                    <option value="large">🧳 Large (2+ suitcases)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Offer Trip <ChevronRightIcon className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
