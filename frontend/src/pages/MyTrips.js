import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { rideShareAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  TruckIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  EyeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function MyTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await rideShareAPI.getMyTrips();
      setTrips(res.data.trips || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <SparklesIcon className="w-4 h-4 animate-pulse" />
            Your Shared Trips
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            My Trips
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage your offered trips and passenger requests
          </p>
        </motion.div>

        {trips.length === 0 ? (
          <div className="text-center py-16 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
            <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No trips offered yet</h3>
            <p className="text-gray-500 mb-4">
              Share your journey and earn back rental cost
            </p>
            <button
              onClick={() => navigate("/offer-trip")}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg"
            >
              Offer a Trip
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip, idx) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold">{trip.fromCity}</span>
                      <span>→</span>
                      <MapPinIcon className="w-4 h-4 text-green-500" />
                      <span className="font-semibold">{trip.toCity}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />{" "}
                        {new Date(trip.departureDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />{" "}
                        {trip.availableSeats}/{trip.totalSeats} seats
                      </span>
                      <span className="flex items-center gap-1">
                        <CurrencyRupeeIcon className="w-4 h-4" /> ₹
                        {trip.pricePerSeat}/seat
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${trip.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {trip.status}
                      </span>
                      {trip.pendingRequests > 0 && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                          {trip.pendingRequests} pending request(s)
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/trip-requests")}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
                  >
                    <EyeIcon className="w-4 h-4" /> Manage
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
