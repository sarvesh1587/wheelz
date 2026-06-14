/**
 * User Dashboard — With Confetti & Skeleton Loaders
 * File: frontend/src/pages/Dashboard.js
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  bookingAPI,
  wishlistAPI,
  vehicleAPI,
  paymentAPI,
  rideShareAPI,
} from "../services/api";
import toast from "react-hot-toast";
import {
  CalendarIcon,
  HeartIcon,
  UserCircleIcon,
  CreditCardIcon,
  TruckIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  UserGroupIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import PaymentReceipt from "../components/PaymentReceipt";
import { useConfetti } from "../hooks/useConfetti";
import { DashboardSkeleton } from "../components/common/Skeleton";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fireBookingConfetti, firePaymentConfetti } = useConfetti();

  // State
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);

  // Rideshare states
  const [myTrips, setMyTrips] = useState([]);
  const [myRides, setMyRides] = useState([]);
  const [cancellingTrip, setCancellingTrip] = useState(null);
  const [cancellingRide, setCancellingRide] = useState(null);
  const [processingRidePayment, setProcessingRidePayment] = useState(null);

  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [chatRide, setChatRide] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef(null);

  // Rating states
  const [showRating, setShowRating] = useState(false);
  const [ratingRide, setRatingRide] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  // Report states
  const [showReport, setShowReport] = useState(false);
  const [reportRide, setReportRide] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  // Receipt states
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptBooking, setReceiptBooking] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchRideShareData();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const viewPassengerDetails = (request) => {
    setSelectedPassenger(request);
    setShowPassengerModal(true);
  };

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, wishlistRes, statsRes] = await Promise.all([
        bookingAPI.getAll(),
        wishlistAPI.get(),
        bookingAPI.getMyStats(),
      ]);
      setBookings(bookingsRes.data.bookings || []);
      setWishlist(wishlistRes.data.wishlist || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRideShareData = async () => {
    try {
      const [tripsRes, ridesRes] = await Promise.all([
        rideShareAPI.getMyTrips(),
        rideShareAPI.getMyRides(),
      ]);
      setMyTrips(tripsRes.data.trips || []);
      setMyRides(ridesRes.data.rides || []);
    } catch (err) {
      console.error("Rideshare data error:", err);
    }
  };

  // ─── RIDE SHARE FUNCTIONS ────────────────────────────────────────────────

  const cancelTrip = async (tripId) => {
    if (
      !window.confirm(
        "Cancel this trip? All passenger requests will be cancelled.",
      )
    )
      return;
    setCancellingTrip(tripId);
    try {
      await rideShareAPI.cancelTrip(tripId, "Cancelled by driver");
      toast.success("Trip cancelled");
      fetchRideShareData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel trip");
    } finally {
      setCancellingTrip(null);
    }
  };

  const cancelRideRequest = async (requestId) => {
    if (!window.confirm("Cancel this ride request?")) return;
    setCancellingRide(requestId);
    try {
      await rideShareAPI.cancelRequest(requestId);
      toast.success("Ride request cancelled");
      fetchRideShareData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel");
    } finally {
      setCancellingRide(null);
    }
  };

  const initiateRidePayment = async (ride) => {
    setProcessingRidePayment(ride._id);
    try {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = async () => {
        try {
          const orderRes = await rideShareAPI.createPayment(ride._id);
          const orderData = orderRes.data;

          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Wheelz",
            description: `Ride: ${ride.trip?.fromCity} → ${ride.trip?.toCity}`,
            order_id: orderData.orderId,
            handler: async (response) => {
              try {
                await rideShareAPI.verifyPayment({
                  requestId: ride._id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });
                toast.success("✅ Payment successful! Ride confirmed.");
                firePaymentConfetti(); // 🎉
                fetchRideShareData();
              } catch (error) {
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
                setProcessingRidePayment(null);
              },
            },
          };
          const razorpay = new window.Razorpay(options);
          razorpay.open();
        } catch (error) {
          toast.error("Failed to create payment");
        }
      };
      document.body.appendChild(script);
    } catch (error) {
      toast.error("Payment failed");
    } finally {
      setProcessingRidePayment(null);
    }
  };

  // ─── CHAT FUNCTIONS ──────────────────────────────────────────────────────

  const openChat = async (ride) => {
    setChatRide(ride);
    setShowChat(true);
    try {
      const res = await rideShareAPI.getMessages(ride._id);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatRide) return;
    setSendingMessage(true);
    try {
      const res = await rideShareAPI.sendMessage(chatRide._id, {
        text: newMessage,
      });
      setMessages((prev) => [...prev, res.data.message]);
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleChatKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── RATING FUNCTIONS ────────────────────────────────────────────────────

  const openRating = (ride) => {
    setRatingRide(ride);
    setRating(0);
    setReview("");
    setShowRating(true);
  };

  const submitRating = async () => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }
    setSubmittingRating(true);
    try {
      await rideShareAPI.rateUser(ratingRide._id, {
        rating,
        review,
        rateWho: "driver",
      });
      toast.success("Thank you for your rating! ⭐");
      setShowRating(false);
      fetchRideShareData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  // ─── REPORT FUNCTIONS ────────────────────────────────────────────────────

  const openReport = (ride) => {
    setReportRide(ride);
    setReportReason("");
    setShowReport(true);
  };

  const submitReport = async () => {
    if (!reportReason.trim()) {
      toast.error("Please describe the issue");
      return;
    }
    setSubmittingReport(true);
    try {
      await rideShareAPI.reportRide(reportRide._id, { reason: reportReason });
      toast.success("Report submitted. We'll review this.");
      setShowReport(false);
    } catch (error) {
      toast.error("Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

  // ─── BOOKING FUNCTIONS ───────────────────────────────────────────────────

  const cancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await bookingAPI.cancel(bookingId);
        toast.success("Booking cancelled successfully");
        fetchDashboardData();
      } catch (error) {
        toast.error("Failed to cancel booking");
      }
    }
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const processPayment = async (booking) => {
    setProcessingPayment(true);
    try {
      if (!window.Razorpay) {
        toast.error("Payment system loading...");
        setProcessingPayment(false);
        return;
      }
      toast.loading("Creating payment order...", { id: "payment" });
      const orderResponse = await paymentAPI.createOrder(booking._id);
      toast.dismiss("payment");
      if (!orderResponse.data.orderId) {
        toast.error("Failed to create payment order");
        setProcessingPayment(false);
        return;
      }

      const options = {
        key: orderResponse.data.keyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: "Wheelz",
        description: `Booking: ${booking.bookingRef}`,
        order_id: orderResponse.data.orderId,
        handler: async (paymentResponse) => {
          toast.loading("Verifying payment...", { id: "verify" });
          try {
            const verifyResponse = await paymentAPI.verifyPayment({
              bookingId: booking._id,
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            });
            toast.dismiss("verify");
            if (verifyResponse.data.success) {
              toast.success("✅ Payment successful!");
              fireBookingConfetti(); // 🎉
              fetchDashboardData();
              setShowBookingModal(false);
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            toast.dismiss("verify");
            toast.error("Payment verification failed");
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: "#f59e0b" },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
          },
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.dismiss("payment");
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  // ─── STATUS BADGES ──────────────────────────────────────────────────────

  const getStatusBadge = (status) => {
    const badges = {
      confirmed:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      pending:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      completed:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      active:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      full: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      approved:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return badges[status] || badges.pending;
  };

  const getRideStatusBadge = (status, paymentStatus) => {
    if (status === "pending")
      return {
        bg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: "⏳",
        label: "Pending Approval",
      };
    if (status === "approved" && paymentStatus !== "paid")
      return {
        bg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        icon: "💰",
        label: "Pay Now",
      };
    if (status === "approved" && paymentStatus === "paid")
      return {
        bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        icon: "✅",
        label: "Confirmed",
      };
    if (status === "rejected")
      return {
        bg: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        icon: "❌",
        label: "Rejected",
      };
    if (status === "cancelled")
      return {
        bg: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
        icon: "🚫",
        label: "Cancelled",
      };
    if (status === "completed")
      return {
        bg: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        icon: "🏁",
        label: "Completed",
      };
    return { bg: "bg-gray-100 text-gray-700", icon: "📋", label: status };
  };

  // ─── FILTER RIDES ───────────────────────────────────────────────────────

  const upcomingRides = myRides.filter(
    (r) =>
      ["pending", "approved"].includes(r.status) ||
      (r.status === "approved" && r.paymentStatus === "paid"),
  );
  const pastRides = myRides.filter((r) =>
    ["completed", "cancelled", "rejected"].includes(r.status),
  );

  // ─── STATS ──────────────────────────────────────────────────────────────

  const statsCards = [
    {
      label: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: CalendarIcon,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Active Bookings",
      value: stats?.activeBookings || 0,
      icon: ClockIcon,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Total Spent",
      value: `₹${stats?.totalSpent?.toLocaleString() || 0}`,
      icon: CreditCardIcon,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Wishlist",
      value: wishlist.length,
      icon: HeartIcon,
      color: "from-red-500 to-red-600",
    },
  ];

  // ─── SKELETON LOADING ───────────────────────────────────────────────────

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your bookings, rides, and more
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1">
          {[
            { id: "bookings", label: "My Bookings", icon: CalendarIcon },
            { id: "wishlist", label: "Wishlist", icon: HeartIcon },
            { id: "myrides", label: "My Rides", icon: UserGroupIcon },
            { id: "mytrips", label: "My Shared Trips", icon: TruckIcon },
            { id: "profile", label: "Profile", icon: UserCircleIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg transition-all whitespace-nowrap font-medium text-sm ${activeTab === tab.id ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
              {tab.id === "myrides" && myRides.length > 0 && (
                <span className="ml-1 bg-white text-amber-500 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {myRides.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ========== MY BOOKINGS TAB ========== */}
        {activeTab === "bookings" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {bookings.length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title="No Bookings Yet"
                description="Start your first adventure with Wheelz!"
                action="Browse Vehicles"
                onAction={() => navigate("/vehicles")}
              />
            ) : (
              bookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  user={user}
                  onViewDetails={viewBookingDetails}
                  onProcessPayment={processPayment}
                  onCancelBooking={cancelBooking}
                  processingPayment={processingPayment}
                  setReceiptBooking={setReceiptBooking}
                  setShowReceipt={setShowReceipt}
                />
              ))
            )}
          </motion.div>
        )}

        {/* ========== WISHLIST TAB ========== */}
        {activeTab === "wishlist" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {wishlist.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={HeartIcon}
                  title="Wishlist Empty"
                  description="Save your favorite vehicles here!"
                  action="Explore Vehicles"
                  onAction={() => navigate("/vehicles")}
                />
              </div>
            ) : (
              wishlist.map((item) => (
                <WishlistCard key={item._id} item={item} navigate={navigate} />
              ))
            )}
          </motion.div>
        )}

        {/* ========== PROFILE TAB ========== */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.name}
                </h2>
                <p className="text-gray-500">{user?.email}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Member since {new Date(user?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.phone || "Not added"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.city || "Not added"}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
            >
              Edit Profile
            </button>
          </motion.div>
        )}

        {/* ========== MY SHARED TRIPS TAB ========== */}
        {activeTab === "mytrips" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {myTrips.length === 0 ? (
              <EmptyState
                icon={TruckIcon}
                title="No Trips Offered"
                description="Share your journey and split costs!"
                action="Offer a Trip"
                onAction={() => navigate("/offer-trip")}
              />
            ) : (
              myTrips.map((trip) => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  navigate={navigate}
                  onCancel={cancelTrip}
                  cancellingTrip={cancellingTrip}
                  onViewPassengers={async (trip) => {
                    try {
                      const res = await rideShareAPI.getTripRequests(trip._id);
                      const requests = res.data.requests || [];
                      if (requests.length > 0)
                        viewPassengerDetails(requests[0]);
                      else toast.error("No passenger requests found");
                    } catch (error) {
                      toast.error("Failed to load passenger details");
                    }
                  }}
                />
              ))
            )}
          </motion.div>
        )}

        {/* ========== MY RIDES TAB ========== */}
        {activeTab === "myrides" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex gap-4 mb-6">
              {["upcoming", "past", "all"].map((subtab) => (
                <button
                  key={subtab}
                  onClick={() => setActiveTab(subtab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === subtab ? "bg-amber-500 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"}`}
                >
                  {subtab === "upcoming" &&
                    `Upcoming (${upcomingRides.length})`}
                  {subtab === "past" && `Past (${pastRides.length})`}
                  {subtab === "all" && `All (${myRides.length})`}
                </button>
              ))}
            </div>

            {myRides.length === 0 ? (
              <EmptyState
                icon={UserGroupIcon}
                title="No Rides Found"
                description="Find a trip and request a seat!"
                action="Find a Trip"
                onAction={() => navigate("/find-trip")}
              />
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {(activeTab === "upcoming"
                  ? upcomingRides
                  : activeTab === "past"
                    ? pastRides
                    : myRides
                ).map((ride) => {
                  const trip = ride.trip;
                  const statusBadge = getRideStatusBadge(
                    ride.status,
                    ride.paymentStatus,
                  );
                  return (
                    <motion.div
                      key={ride._id}
                      variants={itemVariants}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <MapPinIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-semibold text-gray-900 dark:text-white truncate">
                                  {trip?.fromCity}
                                </span>
                                <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <MapPinIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="font-semibold text-gray-900 dark:text-white truncate">
                                  {trip?.toCity}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                <span>
                                  {trip
                                    ? new Date(
                                        trip.departureDate,
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                <span>{trip?.departureTime || "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <UserGroupIcon className="w-4 h-4 text-gray-400" />
                                <span>{ride.seatsRequested} seat(s)</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CurrencyRupeeIcon className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold text-amber-500">
                                  ₹{ride.totalAmount}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {trip?.driver?.name?.[0]?.toUpperCase() || "D"}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900 dark:text-white">
                                  {trip?.driver?.name || "Driver"}
                                </p>
                                <p className="text-xs text-gray-500">Driver</p>
                              </div>
                              {ride.status === "approved" &&
                                ride.paymentStatus === "paid" && (
                                  <div className="ml-auto flex items-center gap-2 text-xs text-green-600">
                                    <ShieldCheckIcon className="w-4 h-4" />
                                    <span>Contact Shared</span>
                                  </div>
                                )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span
                              className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium mb-3 ${statusBadge.bg}`}
                            >
                              {statusBadge.icon} {statusBadge.label}
                            </span>
                            <div className="flex flex-wrap gap-2 justify-end">
                              {ride.status === "pending" && (
                                <button
                                  onClick={() => cancelRideRequest(ride._id)}
                                  disabled={cancellingRide === ride._id}
                                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
                                >
                                  {cancellingRide === ride._id
                                    ? "Cancelling..."
                                    : "Cancel"}
                                </button>
                              )}
                              {ride.status === "approved" &&
                                ride.paymentStatus !== "paid" && (
                                  <button
                                    onClick={() => initiateRidePayment(ride)}
                                    disabled={
                                      processingRidePayment === ride._id
                                    }
                                    className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-1"
                                  >
                                    {processingRidePayment === ride._id ? (
                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <>
                                        <CreditCardIcon className="w-3 h-3" />
                                        Pay ₹{ride.totalAmount}
                                      </>
                                    )}
                                  </button>
                                )}
                              {(ride.paymentStatus === "paid" ||
                                ride.status === "completed") && (
                                <>
                                  <button
                                    onClick={() => openChat(ride)}
                                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg flex items-center gap-1 transition-colors"
                                  >
                                    <ChatBubbleLeftRightIcon className="w-3 h-3" />{" "}
                                    Chat
                                  </button>
                                  <button
                                    onClick={() =>
                                      navigate(`/rideshare/${trip?._id}`)
                                    }
                                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-lg flex items-center gap-1 transition-colors"
                                  >
                                    <EyeIcon className="w-3 h-3" /> View
                                  </button>
                                </>
                              )}
                              {ride.status === "completed" &&
                                !ride.driverRatedByPassenger && (
                                  <button
                                    onClick={() => openRating(ride)}
                                    className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg flex items-center gap-1 transition-colors"
                                  >
                                    <StarIcon className="w-3 h-3" /> Rate
                                  </button>
                                )}
                              {["approved", "completed"].includes(
                                ride.status,
                              ) && (
                                <button
                                  onClick={() => openReport(ride)}
                                  className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded-lg flex items-center gap-1 transition-colors"
                                >
                                  <ExclamationTriangleIcon className="w-3 h-3" />{" "}
                                  Report
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        {ride.paymentStatus === "paid" &&
                          ride.status === "approved" && (
                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                  Payment confirmed! Your seat is booked.
                                </span>
                              </div>
                              <span className="text-sm font-bold text-green-700 dark:text-green-400">
                                ₹{ride.totalAmount}
                              </span>
                            </div>
                          )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* ========== CHAT MODAL ========== */}
      <AnimatePresence>
        {showChat && chatRide && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-500 to-amber-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-600 font-bold">
                    {chatRide.trip?.driver?.name?.[0]?.toUpperCase() || "D"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {chatRide.trip?.driver?.name}
                    </h3>
                    <p className="text-xs text-amber-100">
                      {chatRide.trip?.fromCity} → {chatRide.trip?.toCity}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="h-80 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      Start the conversation with your driver
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender?._id === user?._id || msg.sender === user?._id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl ${msg.sender?._id === user?._id || msg.sender === user?._id ? "bg-amber-500 text-white rounded-br-md" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md"}`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleChatKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white rounded-xl transition-colors"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== PASSENGER DETAIL MODAL ========== */}
      <AnimatePresence>
        {showPassengerModal && selectedPassenger && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPassengerModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">
                    Passenger Details
                  </h3>
                  <button
                    onClick={() => setShowPassengerModal(false)}
                    className="p-1 rounded-full hover:bg-white/20"
                  >
                    <XMarkIcon className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                    {selectedPassenger.passenger?.name?.[0]?.toUpperCase() ||
                      "P"}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedPassenger.passenger?.name || "Passenger"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedPassenger.passenger?.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-sm">
                      {selectedPassenger.passenger?.phone || "Not shared yet"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Seats Requested</p>
                    <p className="font-medium text-sm">
                      {selectedPassenger.seatsRequested}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Status</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${selectedPassenger.status === "approved" ? "bg-green-100 text-green-700" : selectedPassenger.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                    >
                      {selectedPassenger.status}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Payment</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${selectedPassenger.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {selectedPassenger.paymentStatus || "pending"}
                    </span>
                  </div>
                  <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-bold text-amber-500">
                      ₹{selectedPassenger.totalAmount}
                    </p>
                  </div>
                  {selectedPassenger.message && (
                    <div className="col-span-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                      <p className="text-xs text-gray-500">Message</p>
                      <p className="text-sm italic">
                        "{selectedPassenger.message}"
                      </p>
                    </div>
                  )}
                </div>
                {selectedPassenger.status === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={async () => {
                        await rideShareAPI.respondToRequest(
                          selectedPassenger._id,
                          { action: "approve" },
                        );
                        toast.success("Passenger approved!");
                        setShowPassengerModal(false);
                        fetchRideShareData();
                      }}
                      className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={async () => {
                        await rideShareAPI.respondToRequest(
                          selectedPassenger._id,
                          { action: "reject" },
                        );
                        toast.success("Passenger rejected");
                        setShowPassengerModal(false);
                        fetchRideShareData();
                      }}
                      className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
                {selectedPassenger.status === "approved" &&
                  selectedPassenger.paymentStatus === "paid" && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setShowPassengerModal(false);
                          openChat(selectedPassenger);
                        }}
                        className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" /> Chat
                        with Passenger
                      </button>
                    </div>
                  )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== RATING MODAL ========== */}
      <AnimatePresence>
        {showRating && ratingRide && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRating(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Rate Your Driver
              </h3>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    {star <= rating ? (
                      <StarIconSolid className="w-8 h-8 text-amber-400" />
                    ) : (
                      <StarIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review (optional)..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRating(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRating}
                  disabled={submittingRating || !rating}
                  className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  {submittingRating ? "Submitting..." : "Submit Rating"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== RECEIPT MODAL ========== */}
      {showReceipt && receiptBooking && (
        <PaymentReceipt
          booking={receiptBooking}
          onClose={() => {
            setShowReceipt(false);
            setReceiptBooking(null);
          }}
        />
      )}

      {/* ========== REPORT MODAL ========== */}
      <AnimatePresence>
        {showReport && reportRide && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReport(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Report Issue
                </h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Report an issue with driver:{" "}
                <strong>{reportRide.trip?.driver?.name}</strong>
              </p>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe the issue..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReport(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReport}
                  disabled={submittingReport || !reportReason.trim()}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  {submittingReport ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, description, action, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
        >
          {action}
        </button>
      )}
    </motion.div>
  );
}

function BookingCard({
  booking,
  onViewDetails,
  onProcessPayment,
  onCancelBooking,
  processingPayment,
  setReceiptBooking,
  setShowReceipt,
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <img
          src={booking.vehicle?.images?.[0]}
          alt={booking.vehicle?.name}
          className="w-24 h-24 rounded-xl object-cover"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {booking.vehicle?.name}
              </h3>
              <p className="text-sm text-gray-500">
                {booking.vehicle?.brand} • {booking.vehicle?.year}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${booking.status === "confirmed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : booking.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                >
                  {booking.status?.toUpperCase()}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${booking.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {booking.paymentStatus?.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-amber-500">
                ₹{booking.totalAmount?.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {booking.paymentStatus !== "paid" &&
                booking.status !== "confirmed" ? (
                  <button
                    onClick={() => onProcessPayment(booking)}
                    disabled={processingPayment}
                    className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg"
                  >
                    {processingPayment ? "Processing..." : "Pay Now"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setReceiptBooking(booking);
                      setShowReceipt(true);
                    }}
                    className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    📥 Receipt
                  </button>
                )}
                <button
                  onClick={() => onViewDetails(booking)}
                  className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg"
                >
                  View
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />{" "}
              {new Date(booking.startDate).toLocaleDateString()} -{" "}
              {new Date(booking.endDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" /> {booking.pickupLocation}
            </span>
          </div>
          {booking.status === "pending" && booking.paymentStatus !== "paid" && (
            <button
              onClick={() => onCancelBooking(booking._id)}
              className="mt-3 text-sm text-red-500 hover:text-red-600"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function WishlistCard({ item, navigate }) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
    >
      <img
        src={item.vehicle?.images?.[0]}
        alt={item.vehicle?.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white">
          {item.vehicle?.name}
        </h3>
        <p className="text-sm text-gray-500">{item.vehicle?.brand}</p>
        <div className="flex items-center gap-1 mt-2">
          <StarIconSolid className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium">
            {item.vehicle?.averageRating || 0}
          </span>
          <span className="text-xs text-gray-400">
            ({item.vehicle?.totalReviews || 0})
          </span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-amber-500">
            ₹{item.vehicle?.currentPrice?.toLocaleString()}
            <span className="text-xs text-gray-400">/day</span>
          </span>
          <button
            onClick={() => navigate(`/vehicles/${item.vehicle?._id}`)}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm"
          >
            Book Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function TripCard({
  trip,
  navigate,
  onCancel,
  cancellingTrip,
  onViewPassengers,
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPinIcon className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-gray-900 dark:text-white">
              {trip.fromCity}
            </span>
            <span className="text-gray-400">→</span>
            <MapPinIcon className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-gray-900 dark:text-white">
              {trip.toCity}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
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
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${trip.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
            >
              {trip.status}
            </span>
            {trip.pendingRequests > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                {trip.pendingRequests} pending
              </span>
            )}
            {trip.approvedPassengers > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {trip.approvedPassengers} approved
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(trip.pendingRequests > 0 || trip.approvedPassengers > 0) && (
            <button
              onClick={() => onViewPassengers(trip)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm flex items-center gap-1"
            >
              <UserGroupIcon className="w-4 h-4" /> Passengers
            </button>
          )}
          <button
            onClick={() => navigate(`/rideshare/${trip._id}`)}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm"
          >
            View Trip
          </button>
          {(trip.status === "active" || trip.status === "full") && (
            <button
              onClick={() => onCancel(trip._id)}
              disabled={cancellingTrip === trip._id}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            >
              {cancellingTrip === trip._id ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
