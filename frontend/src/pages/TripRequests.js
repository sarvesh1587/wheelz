import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { rideShareAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  UserCircleIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  UserGroupIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function TripRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Try to get requests directly from the API
      const response = await rideShareAPI.getDriverRequests();
      console.log("Driver requests response:", response.data);

      if (response.data && response.data.requests) {
        setRequests(response.data.requests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      // If the endpoint doesn't exist, try alternative method
      try {
        // Fallback: Get all trips and extract requests
        const tripsRes = await rideShareAPI.getMyTrips();
        const trips = tripsRes.data.trips || [];
        const allRequests = [];

        for (const trip of trips) {
          if (trip.requests && trip.requests.length > 0) {
            trip.requests.forEach((req) => {
              allRequests.push({
                ...req,
                trip: trip,
              });
            });
          }
        }
        setRequests(allRequests);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        toast.error("Failed to load requests");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, tripId) => {
    setProcessingId(requestId);
    try {
      await rideShareAPI.respond(requestId, { status: "approved" });
      toast.success("Request approved! Passenger notified.");
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Approve error:", error);
      toast.error(error.response?.data?.message || "Failed to approve");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      await rideShareAPI.respond(requestId, { status: "rejected" });
      toast.success("Request rejected");
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Reject error:", error);
      toast.error(error.response?.data?.message || "Failed to reject");
    } finally {
      setProcessingId(null);
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
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-500 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <SparklesIcon className="w-4 h-4 animate-pulse" />
            Passenger Requests
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Trip Requests
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Approve or reject passengers who want to join your trip
          </p>
        </motion.div>

        {requests.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="text-5xl mb-4">🚗</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No pending requests
            </h3>
            <p className="text-gray-500">
              When passengers request to join your trips, they'll appear here
            </p>
            <button
              onClick={() => navigate("/offer-trip")}
              className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg"
            >
              Offer a Trip
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req, idx) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700"
              >
                {/* Trip Info Header */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-5 py-3 border-b border-amber-100 dark:border-amber-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {req.trip?.fromCity || req.fromCity || "Starting Point"}
                      </span>
                      <span>→</span>
                      <MapPinIcon className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {req.trip?.toCity || req.toCity || "Destination"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {req.trip?.departureDate
                          ? new Date(
                              req.trip.departureDate,
                            ).toLocaleDateString()
                          : req.departureDate
                            ? new Date(req.departureDate).toLocaleDateString()
                            : "Date TBD"}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserGroupIcon className="w-3 h-3" />
                        {req.seatsRequested || 1} seat(s)
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Passenger Info */}
                <div className="p-5">
                  <div className="flex flex-wrap gap-5">
                    {/* Avatar & Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {req.passenger?.name?.[0]?.toUpperCase() ||
                          req.user?.name?.[0]?.toUpperCase() ||
                          "P"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {req.passenger?.name || req.user?.name || "Passenger"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                            Verified User
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <EnvelopeIcon className="w-4 h-4" />
                          {req.passenger?.email ||
                            req.user?.email ||
                            "Email not available"}
                        </div>
                      </div>
                      {req.message && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Message from passenger:
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {req.message}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(req._id, req.trip?._id)}
                        disabled={processingId === req._id}
                        className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req._id)}
                        disabled={processingId === req._id}
                        className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
