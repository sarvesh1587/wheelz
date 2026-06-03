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
  ChatBubbleLeftIcon,
  MapIcon,
  CreditCardIcon,
  DocumentTextIcon,
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
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showTracking, setShowTracking] = useState(false);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      const tripRes = await rideShareAPI.getOne(id);
      setTrip(tripRes.data.trip);

      try {
        const requestsRes = await rideShareAPI.getTripRequests(id);
        setRequests(requestsRes.data.requests || []);
      } catch (err) {
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
            await rideShareAPI.verifyPayment({
              requestId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment successful! Trip confirmed.");
            fetchTripDetails();
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone,
          },
          theme: { color: "#f59e0b" },
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const loadChat = async (requestId) => {
    try {
      const res = await rideShareAPI.getMessages(requestId);
      setMessages(res.data.messages || []);
      setShowChat(true);
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const sendMessage = async (requestId) => {
    if (!newMessage.trim()) return;
    try {
      await rideShareAPI.sendMessage(requestId, newMessage);
      setNewMessage("");
      loadChat(requestId);
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const isDriver = user?._id === trip?.driver?._id;
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const pendingRequests = requests.filter((r) => r.status === "pending");

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

        {/* Driver Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserCircleIcon className="w-5 h-5 text-amber-500" /> Driver
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {trip.driver?.name?.[0]?.toUpperCase() || "D"}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {trip.driver?.name || "Driver"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  ✅ Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests - Driver View */}
        {isDriver && pendingRequests.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-amber-500" /> Pending
              Requests ({pendingRequests.length})
            </h2>
            {pendingRequests.map((req) => (
              <div key={req._id} className="border rounded-xl p-4 mb-3">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="font-medium">{req.passenger?.name}</p>
                    <p className="text-xs text-gray-500">
                      {req.seatsRequested} seat(s) •{" "}
                      {req.message && `"${req.message}"`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(req._id)}
                      disabled={processingId === req._id}
                      className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
                      disabled={processingId === req._id}
                      className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approved & Payment Pending - Passenger View */}
        {!isDriver &&
          approvedRequests
            .filter(
              (r) =>
                r.passenger?._id === user?._id && r.paymentStatus !== "paid",
            )
            .map((req) => (
              <div
                key={req._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border-2 border-amber-500"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" /> Trip
                  Approved!
                </h2>
                <p className="text-gray-600 mb-4">
                  Your seat request has been approved! Complete payment to
                  confirm your seat.
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium">
                    Amount to Pay:{" "}
                    <span className="text-2xl font-bold text-amber-600">
                      ₹{req.totalAmount}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => initiatePayment(req._id, req.totalAmount)}
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
            ))}

        {/* Confirmed Trip - After Payment */}
        {!isDriver &&
          approvedRequests
            .filter(
              (r) =>
                r.passenger?._id === user?._id && r.paymentStatus === "paid",
            )
            .map((req) => (
              <div
                key={req._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border-2 border-green-500"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" /> Trip
                  Confirmed!
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500">Driver Contact</p>
                    <p className="font-medium flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4" />{" "}
                      {trip.driver?.phone || "Will be shared"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500">Payment Status</p>
                    <p className="font-medium text-green-600">
                      ✅ Paid - ₹{req.totalAmount}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => loadChat(req._id)}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <ChatBubbleLeftIcon className="w-4 h-4" /> Chat with Driver
                  </button>
                  <button
                    onClick={() => setShowTracking(true)}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <MapIcon className="w-4 h-4" /> Live Tracking
                  </button>
                </div>
              </div>
            ))}

        {/* Request Seat - Only for passengers who haven't requested */}
        {!isDriver &&
          !approvedRequests.some((r) => r.passenger?._id === user?._id) &&
          trip.availableSeats > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-500" /> Request a
                Seat
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

        {/* Chat Modal */}
        {showChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold">
                  Chat with {isDriver ? "Passenger" : "Driver"}
                </h3>
                <button onClick={() => setShowChat(false)}>✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={
                      msg.sender?._id === user?._id ? "text-right" : "text-left"
                    }
                  >
                    <span className="inline-block px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                      {msg.text}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={() => sendMessage(approvedRequests[0]?._id)}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
