import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { rideShareAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
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
      const res = await rideShareAPI.getDriverRequests();
      setRequests(res.data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setProcessingId(requestId);
    try {
      await rideShareAPI.respondToRequest(requestId, { action: "approve" });
      toast.success("Request approved! Passenger notified.");
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      await rideShareAPI.respondToRequest(requestId, { action: "reject" });
      toast.success("Request rejected");
      fetchRequests();
    } catch (error) {
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
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-500 mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Back to Dashboard
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <SparklesIcon className="w-4 h-4 animate-pulse" /> Passenger
            Requests
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
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req, idx) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700"
              >
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-5 py-3 border-b border-amber-100 dark:border-amber-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-amber-500" />
                      <span className="font-medium">{req.trip?.fromCity}</span>
                      <span>→</span>
                      <MapPinIcon className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{req.trip?.toCity}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />{" "}
                        {new Date(req.trip?.departureDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserGroupIcon className="w-3 h-3" />{" "}
                        {req.seatsRequested} seat(s)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-5">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {req.passenger?.name?.[0]?.toUpperCase() || "P"}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {req.passenger?.name || "Passenger"}
                        </h3>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <EnvelopeIcon className="w-4 h-4" />{" "}
                        {req.passenger?.email || "Email not available"}
                      </div>
                      {req.message && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Message:</p>
                          <p className="text-sm">{req.message}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(req._id)}
                        disabled={processingId === req._id}
                        className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
                      >
                        <CheckCircleIcon className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(req._id)}
                        disabled={processingId === req._id}
                        className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                      >
                        <XCircleIcon className="w-4 h-4" /> Reject
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
