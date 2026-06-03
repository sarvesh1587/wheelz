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
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      // Fetch trip details
      const tripRes = await rideShareAPI.getOne(id);
      console.log("Trip data:", tripRes.data);
      setTrip(tripRes.data.trip);

      // Fetch all requests for this trip
      try {
        const requestsRes = await rideShareAPI.getTripRequests(id);
        console.log("Requests data:", requestsRes.data);
        setRequests(requestsRes.data.requests || []);
      } catch (err) {
        console.log("No requests found:", err);
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

  const initiatePayment = async (requestId, amount) => {
    setProcessingPayment(true);
    try {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = async () => {
        try {
          const orderRes = await rideShareAPI.createPayment(requestId);
          const orderData = orderRes.data;

          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Wheelz",
            description: "Ride Share Payment",
            order_id: orderData.orderId,
            handler: async (response) => {
              try {
                await rideShareAPI.verifyPayment({
                  requestId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });
                toast.success("Payment successful! Trip confirmed.");
                fetchTripDetails();
              } catch (error) {
                console.error("Verification error:", error);
                toast.error("Payment verification failed");
              }
            },
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.phone,
            },
            theme: { color: "#f59e0b" },
            modal: {
              ondismiss: () => {
                toast.error("Payment cancelled");
                setProcessingPayment(false);
              },
            },
          };
          const razorpay = new window.Razorpay(options);
          razorpay.open();
        } catch (error) {
          console.error("Order creation error:", error);
          toast.error("Failed to create payment order");
        }
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const isDriver = user?._id === trip?.driver?._id;
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const userRequest = requests.find((r) => r.passenger?._id === user?._id);
  const isApproved = userRequest?.status === "approved";
  const isPaid = userRequest?.paymentStatus === "paid";

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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-500 mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Back
        </button>

        {/* Trip Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <MapPinIcon className="w-5 h-5 text-amber-500" />
                <span className="text-xl font-semibold">{trip.fromCity}</span>
                <span>→</span>
                <MapPinIcon className="w-5 h-5 text-green-500" />
                <span className="text-xl font-semibold">{trip.toCity}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />{" "}
                  {new Date(trip.departureDate).toLocaleDateString()} at{" "}
                  {trip.departureTime}
                </span>
                <span className="flex items-center gap-1">
                  <UserGroupIcon className="w-4 h-4" /> {trip.availableSeats}/
                  {trip.totalSeats} seats
                </span>
                <span className="flex items-center gap-1">
                  <CurrencyRupeeIcon className="w-4 h-4" /> ₹{trip.pricePerSeat}
                  /seat
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-500">
                ₹{trip.pricePerSeat}
              </div>
              <div className="text-xs text-gray-400">per seat</div>
            </div>
          </div>
        </div>

        {/* Driver Info - Passenger View */}
        {!isDriver && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-amber-500" /> Driver
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {trip.driver?.name?.[0]?.toUpperCase() || "D"}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{trip.driver?.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    ✅ Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ DRIVER SECTION - PASSENGER DETAILS */}
        {isDriver && (
          <>
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-amber-600">
                  <UserGroupIcon className="w-5 h-5" /> Pending Requests (
                  {pendingRequests.length})
                </h2>
                {pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-3"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 font-bold">
                            {req.passenger?.name?.[0]?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {req.passenger?.name || "Passenger"}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <EnvelopeIcon className="w-3 h-3" />{" "}
                              {req.passenger?.email || "Email hidden"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            🎫 {req.seatsRequested} seat(s) requested
                          </p>
                          {req.message && (
                            <p className="text-sm text-gray-500 italic mt-1">
                              💬 "{req.message}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(req._id)}
                          disabled={processingId === req._id}
                          className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req._id)}
                          disabled={processingId === req._id}
                          className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Approved Passengers */}
            {approvedRequests.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-600">
                  <CheckCircleIcon className="w-5 h-5" /> Approved Passengers (
                  {approvedRequests.length})
                </h2>
                {approvedRequests.map((req) => (
                  <div
                    key={req._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-3"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 font-bold">
                            {req.passenger?.name?.[0]?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {req.passenger?.name || "Passenger"}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <EnvelopeIcon className="w-3 h-3" />{" "}
                              {req.passenger?.email}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <PhoneIcon className="w-3 h-3" />{" "}
                              {req.passenger?.phone || "Not available"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            🎫 {req.seatsRequested} seat(s)
                          </p>
                          <p
                            className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${req.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                          >
                            {req.paymentStatus === "paid"
                              ? "Payment Received ✅"
                              : "Payment Pending ⏳"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Requests Message */}
            {pendingRequests.length === 0 && approvedRequests.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 text-center">
                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  No Requests Yet
                </h3>
                <p className="text-gray-500">
                  Share this trip link with potential passengers
                </p>
              </div>
            )}
          </>
        )}

        {/* Payment Section - Passenger View */}
        {!isDriver && isApproved && !isPaid && (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl shadow-xl p-6 mb-6 border-2 border-amber-500">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-amber-700">
              <CreditCardIcon className="w-5 h-5" /> Complete Payment
            </h2>
            <p className="text-gray-700 mb-4">
              Your seat request has been approved! Complete payment to confirm
              your seat.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount to Pay:</span>
                <span className="text-2xl font-bold text-amber-600">
                  ₹{userRequest?.totalAmount}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Seats:</span>
                <span>{userRequest?.seatsRequested} seat(s)</span>
              </div>
            </div>
            <button
              onClick={() =>
                initiatePayment(userRequest?._id, userRequest?.totalAmount)
              }
              disabled={processingPayment}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl flex items-center justify-center gap-2"
            >
              {processingPayment ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCardIcon className="w-5 h-5" /> Pay Now
                </>
              )}
            </button>
          </div>
        )}

        {/* Confirmed Trip - Passenger View */}
        {!isDriver && isPaid && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl shadow-xl p-6 mb-6 border-2 border-green-500">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-700">
              <CheckCircleIcon className="w-5 h-5" /> Trip Confirmed!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500">Driver Contact</p>
                <p className="font-medium flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" />{" "}
                  {trip.driver?.phone || "Contact will be shared"}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500">Payment Status</p>
                <p className="font-medium text-green-600">
                  ✅ Paid - ₹{userRequest?.totalAmount}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Request Seat - Passenger View */}
        {!isDriver && !isApproved && !isPaid && trip.availableSeats > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-amber-500" /> Request a Seat
            </h2>
            <button
              onClick={async () => {
                await rideShareAPI.requestSeat({
                  tripId: id,
                  seatsRequested: 1,
                });
                fetchTripDetails();
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl"
            >
              Request Seat • ₹{trip.pricePerSeat}
            </button>
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-xs text-amber-700 flex items-start gap-2">
                <ShieldCheckIcon className="w-4 h-4 flex-shrink-0" /> ⚠️
                Disclaimer: Cost-sharing arrangement. Verify driver identity
                before boarding.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
