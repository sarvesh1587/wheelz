import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { rideShareAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  PhoneIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

export default function RideShareDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      // Fetch trip details
      const tripRes = await rideShareAPI.getOne(id);
      setTrip(tripRes.data.trip);

      // Fetch all requests for this trip
      try {
        const requestsRes = await rideShareAPI.getTripRequests(id);
        console.log("Requests data:", requestsRes.data);
        setRequests(requestsRes.data.requests || []);
      } catch (err) {
        console.log("No requests found");
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching trip details:", error);
      toast.error("Failed to load trip details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setProcessingId(requestId);
    try {
      await rideShareAPI.respondToRequest(requestId, { action: "approve" });
      toast.success("Request approved! Passenger can now make payment.");
      fetchTripDetails();
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
      fetchTripDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject");
    } finally {
      setProcessingId(null);
    }
  };

  const isDriver = user?._id === trip?.driver?._id;

  // Filter requests by status
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-gray-500">Trip not found</p>
          <button
            onClick={() => navigate("/find-trip")}
            className="mt-4 text-amber-500"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-500 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Back
        </button>

        {/* Trip Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <MapPinIcon className="w-5 h-5 text-amber-500" />
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {trip.fromCity}
                  </span>
                  <span className="text-gray-400">→</span>
                  <MapPinIcon className="w-5 h-5 text-green-500" />
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {trip.toCity}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />{" "}
                    {new Date(trip.departureDate).toLocaleDateString()} at{" "}
                    {trip.departureTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4" /> {trip.availableSeats}/
                    {trip.totalSeats} seats available
                  </span>
                  <span className="flex items-center gap-1">
                    <CurrencyRupeeIcon className="w-4 h-4" /> ₹
                    {trip.pricePerSeat}/seat
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trip.womenOnly && (
                    <span className="text-xs bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 px-2 py-1 rounded-full">
                      👩 Women only
                    </span>
                  )}
                  {trip.petsAllowed && (
                    <span className="text-xs bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                      🐾 Pets allowed
                    </span>
                  )}
                  <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2 py-1 rounded-full">
                    ❄️ AC
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2 py-1 rounded-full">
                    🧳 {trip.luggageAllowed} luggage
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-500">
                  ₹{trip.pricePerSeat}
                </div>
                <div className="text-xs text-gray-400">per seat</div>
                <div
                  className={`mt-2 text-xs px-2 py-1 rounded-full ${trip.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"}`}
                >
                  {trip.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Info - Only show if you are passenger */}
        {!isDriver && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <UserCircleIcon className="w-5 h-5 text-amber-500" /> Driver
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {trip.driver?.name?.[0]?.toUpperCase() || "D"}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {trip.driver?.name || "Driver"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                      ✅ Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== DRIVER SECTION - Show Passenger Details ========== */}
        {isDriver && (
          <>
            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                    <UserGroupIcon className="w-5 h-5 text-amber-500" />
                    Pending Requests ({pendingRequests.length})
                  </h2>
                  <div className="space-y-4">
                    {pendingRequests.map((req) => (
                      <div
                        key={req._id}
                        className="border border-gray-100 dark:border-gray-700 rounded-xl p-4"
                      >
                        <div className="flex flex-wrap justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                              {req.passenger?.name?.[0]?.toUpperCase() || "P"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {req.passenger?.name || "Passenger"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <EnvelopeIcon className="w-3 h-3" />{" "}
                                {req.passenger?.email || "Email hidden"}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Seats requested: {req.seatsRequested}
                              </p>
                              {req.message && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                                  "{req.message}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(req._id)}
                              disabled={processingId === req._id}
                              className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-1 text-sm"
                            >
                              <CheckCircleIcon className="w-4 h-4" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(req._id)}
                              disabled={processingId === req._id}
                              className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1 text-sm"
                            >
                              <XCircleIcon className="w-4 h-4" /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Approved Passengers Section - Shows passenger details */}
            {approvedRequests.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    Approved Passengers ({approvedRequests.length})
                  </h2>
                  <div className="space-y-4">
                    {approvedRequests.map((req) => (
                      <div
                        key={req._id}
                        className="border border-gray-100 dark:border-gray-700 rounded-xl p-4"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold">
                              {req.passenger?.name?.[0]?.toUpperCase() || "P"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {req.passenger?.name || "Passenger"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <EnvelopeIcon className="w-3 h-3" />{" "}
                                {req.passenger?.email || "Email hidden"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                <PhoneIcon className="w-3 h-3" />{" "}
                                {req.passenger?.phone ||
                                  "Phone hidden until payment"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {req.seatsRequested} seat(s)
                            </p>
                            <p
                              className={`text-xs px-2 py-0.5 rounded-full mt-1 ${req.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                            >
                              {req.paymentStatus === "paid"
                                ? "Payment Received"
                                : "Payment Pending"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No Requests Message */}
            {pendingRequests.length === 0 && approvedRequests.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
                <div className="p-6 text-center">
                  <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    No Requests Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Share this trip link with potential passengers
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Request Seat - Passenger View */}
        {!isDriver &&
          !approvedRequests.some((r) => r.passenger?._id === user?._id) &&
          trip.availableSeats > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <SparklesIcon className="w-5 h-5 text-amber-500" /> Request a
                  Seat
                </h2>
                <button
                  onClick={async () => {
                    try {
                      await rideShareAPI.requestSeat({
                        tripId: id,
                        seatsRequested: 1,
                      });
                      toast.success("Request sent to driver!");
                      fetchTripDetails();
                    } catch (error) {
                      toast.error(
                        error.response?.data?.message || "Request failed",
                      );
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Request Seat • ₹{trip.pricePerSeat}
                </button>
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                    <ShieldCheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      ⚠️ Disclaimer: This is a cost-sharing arrangement between
                      private individuals. Verify identity before travel.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Already Requested Message - Passenger View */}
        {!isDriver &&
          approvedRequests.some((r) => r.passenger?._id === user?._id) && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 text-center border border-green-200 dark:border-green-800">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                Request Approved!
              </h3>
              <p className="text-green-600 dark:text-green-500 mt-1">
                Your seat request has been approved. Complete payment to confirm
                your seat.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
