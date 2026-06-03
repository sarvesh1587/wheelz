import React, { useState, useEffect } from "react";
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
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import html2pdf from "html2pdf.js";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [myTrips, setMyTrips] = useState([]);
  const [cancellingTrip, setCancellingTrip] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchMyTrips();
  }, []);

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

  const fetchMyTrips = async () => {
    try {
      const res = await rideShareAPI.getMyTrips();
      setMyTrips(res.data.trips || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  const cancelTrip = async (tripId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this trip? All passenger requests will be cancelled.",
      )
    ) {
      return;
    }

    setCancellingTrip(tripId);
    try {
      await rideShareAPI.cancelTrip(tripId, "Cancelled by driver");
      toast.success("Trip cancelled successfully");
      fetchMyTrips();
    } catch (error) {
      console.error("Cancel trip error:", error);
      toast.error(error.response?.data?.message || "Failed to cancel trip");
    } finally {
      setCancellingTrip(null);
    }
  };

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
    };
    return badges[status] || badges.pending;
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      pending:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      refunded: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return badges[status] || badges.pending;
  };

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
        toast.error("Payment system is loading. Please try again.");
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
              toast.success("✅ Payment successful! Booking confirmed.");
              setTimeout(() => fetchDashboardData(), 500);
              setShowBookingModal(false);
              setSelectedBooking(null);
            } else {
              toast.error(
                "Payment verification failed. Please contact support.",
              );
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.dismiss("verify");
            toast.error(
              error.response?.data?.message || "Payment verification failed",
            );
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: "#f59e0b" },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            toast.error("Payment cancelled");
          },
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.dismiss("payment");
      toast.error(
        error.response?.data?.message || "Payment failed. Please try again.",
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const downloadBookingPDF = (booking) => {
    if (booking.paymentStatus !== "paid" && booking.status !== "confirmed") {
      toast.error("Please complete payment first to download receipt");
      return;
    }
    // PDF generation code (keep your existing PDF function)
    toast.success("Downloading receipt...");
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your bookings, manage your wishlist, and explore more rides
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
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
                  className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: "bookings", label: "My Bookings", icon: CalendarIcon },
            { id: "wishlist", label: "Wishlist", icon: HeartIcon },
            { id: "profile", label: "Profile", icon: UserCircleIcon },
            { id: "mytrips", label: "My Shared Trips", icon: TruckIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-amber-500 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
                <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Bookings Yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start your first adventure with Wheelz!
                </p>
                <button
                  onClick={() => navigate("/vehicles")}
                  className="btn-primary inline-flex"
                >
                  Browse Vehicles
                </button>
              </div>
            ) : (
              bookings.map((booking, idx) => {
                const isPaid =
                  booking.paymentStatus === "paid" ||
                  booking.status === "confirmed";
                return (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all"
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
                                className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(booking.status)}`}
                              >
                                {booking.status?.toUpperCase()}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${getPaymentStatusBadge(booking.paymentStatus)}`}
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
                              {isPaid ? (
                                <button
                                  onClick={() => downloadBookingPDF(booking)}
                                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1"
                                >
                                  <DocumentArrowDownIcon className="w-4 h-4" />{" "}
                                  Download Receipt
                                </button>
                              ) : (
                                <button
                                  onClick={() => processPayment(booking)}
                                  disabled={processingPayment}
                                  className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1"
                                >
                                  <CreditCardIcon className="w-4 h-4" />{" "}
                                  {processingPayment
                                    ? "Processing..."
                                    : "Pay Now"}
                                </button>
                              )}
                              <button
                                onClick={() => viewBookingDetails(booking)}
                                className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1"
                              >
                                <EyeIcon className="w-4 h-4" /> View Details
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />{" "}
                            {new Date(booking.startDate).toLocaleDateString()} -{" "}
                            {new Date(booking.endDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <TruckIcon className="w-4 h-4" />{" "}
                            {booking.pickupLocation}
                          </div>
                        </div>
                        {booking.status === "pending" &&
                          booking.paymentStatus !== "paid" && (
                            <button
                              onClick={() => cancelBooking(booking._id)}
                              className="mt-3 text-sm text-red-500 hover:text-red-600"
                            >
                              Cancel Booking
                            </button>
                          )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Wishlist Tab */}
        {activeTab === "wishlist" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {wishlist.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
                <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Your Wishlist is Empty
                </h3>
                <p className="text-gray-500 mb-4">
                  Save your favorite vehicles here!
                </p>
                <button
                  onClick={() => navigate("/vehicles")}
                  className="btn-primary inline-flex"
                >
                  Explore Vehicles
                </button>
              </div>
            ) : (
              wishlist.map((item, idx) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
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
                    <p className="text-sm text-gray-500">
                      {item.vehicle?.brand}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium">
                        {item.vehicle?.averageRating || 0}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({item.vehicle?.totalReviews || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xl font-bold text-amber-500">
                        ₹{item.vehicle?.currentPrice?.toLocaleString()}
                        <span className="text-xs text-gray-400">/day</span>
                      </span>
                      <button
                        onClick={() =>
                          navigate(`/vehicles/${item.vehicle?._id}`)
                        }
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{user?.phone || "Not added"}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{user?.city || "Not added"}</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="mt-6 btn-primary"
            >
              Edit Profile
            </button>
          </motion.div>
        )}

        {/* My Shared Trips Tab - WITH CANCEL OPTION */}
        {activeTab === "mytrips" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {myTrips.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
                <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Trips Offered Yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Share your journey and split costs with fellow travelers!
                </p>
                <button
                  onClick={() => navigate("/offer-trip")}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg"
                >
                  + Offer a Trip
                </button>
              </div>
            ) : (
              myTrips.map((trip) => (
                <div
                  key={trip._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700"
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
                          className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(trip.status)}`}
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/rideshare/${trip._id}`)}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm"
                      >
                        View Details
                      </button>
                      {(trip.status === "active" || trip.status === "full") && (
                        <button
                          onClick={() => cancelTrip(trip._id)}
                          disabled={cancellingTrip === trip._id}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm disabled:opacity-50"
                        >
                          {cancellingTrip === trip._id
                            ? "Cancelling..."
                            : "Cancel Trip"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {showBookingModal && selectedBooking && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b px-6 py-4 flex justify-between">
                <div>
                  <h2 className="text-xl font-bold">Booking Details</h2>
                  <p className="text-sm text-gray-500">
                    ID: {selectedBooking.bookingRef}
                  </p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                  <img
                    src={selectedBooking.vehicle?.images?.[0]}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedBooking.vehicle?.name}
                    </h3>
                    <p className="text-gray-500">
                      {selectedBooking.vehicle?.brand} •{" "}
                      {selectedBooking.vehicle?.year}
                    </p>
                    <p className="text-amber-500 font-semibold">
                      ₹{selectedBooking.pricePerDay?.toLocaleString()}/day
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">Pickup</p>
                    <p className="font-medium">
                      {new Date(selectedBooking.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedBooking.pickupLocation}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">Return</p>
                    <p className="font-medium">
                      {new Date(selectedBooking.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedBooking.dropoffLocation ||
                        selectedBooking.pickupLocation}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between font-bold">
                    <span>Total Amount</span>
                    <span className="text-amber-500 text-xl">
                      ₹
                      {selectedBooking.finalAmount?.toLocaleString() ||
                        selectedBooking.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">Booking Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedBooking.status)}`}
                    >
                      {selectedBooking.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">Payment Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusBadge(selectedBooking.paymentStatus)}`}
                    >
                      {selectedBooking.paymentStatus?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
