import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loadRazorpayScript, initRazorpayPayment } from "../utils/razorpay";
import {
  bookingAPI,
  wishlistAPI,
  vehicleAPI,
  paymentAPI,
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

  useEffect(() => {
    fetchDashboardData();
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

  const getStatusBadge = (status) => {
    const badges = {
      confirmed:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      pending:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      completed:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
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

  // ✅ Process Payment Function
  const processPayment = async (booking) => {
    setProcessingPayment(true);
    try {
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error(
          "Payment system unavailable. Please refresh and try again.",
        );
        setProcessingPayment(false);
        return;
      }

      // Create order on backend
      const response = await paymentAPI.createOrder(booking._id);

      // Initialize payment
      await initRazorpayPayment({
        amount: response.data.amount,
        orderId: response.data.orderId,
        description: `Booking: ${booking.bookingRef}`,
        customerName: user?.name,
        customerEmail: user?.email,
        customerPhone: user?.phone,
      });

      // Verify payment after success
      toast.success("Payment successful! Booking confirmed.");
      fetchDashboardData();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  // ✅ PDF Download Function (Only for paid/bookings)
  const downloadBookingPDF = (booking) => {
    // Only allow download if payment is paid or booking is confirmed
    if (booking.paymentStatus !== "paid" && booking.status !== "confirmed") {
      toast.error("Please complete payment first to download receipt");
      return;
    }

    const pdfContent = document.createElement("div");
    pdfContent.style.padding = "20px";
    pdfContent.style.fontFamily = "Arial, sans-serif";
    pdfContent.style.backgroundColor = "white";

    pdfContent.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f59e0b; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: white;">W</div>
            <h1 style="color: #f59e0b; margin: 0;">WHEELZ</h1>
          </div>
          <h2 style="margin: 10px 0 5px; color: #333;">Payment Receipt & Booking Confirmation</h2>
          <p style="color: #666; margin: 0;">Booking ID: ${booking.bookingRef}</p>
          <p style="color: #666; margin: 5px 0 0;">Date: ${new Date().toLocaleDateString("en-IN")}</p>
        </div>

        <!-- Success Badge -->
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background: #d1fae5; color: #065f46; padding: 8px 20px; border-radius: 30px; font-weight: bold;">
            ✅ PAYMENT SUCCESSFUL | BOOKING CONFIRMED
          </div>
        </div>

        <!-- Customer Details -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f59e0b; margin-bottom: 10px; border-left: 3px solid #f59e0b; padding-left: 10px;">👤 Customer Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; width: 120px;">Full Name</td>
              <td style="padding: 8px;">${booking.user?.name || booking.customerDetails?.name || user?.name || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Email</td>
              <td style="padding: 8px;">${booking.user?.email || booking.customerDetails?.email || user?.email || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Phone</td>
              <td style="padding: 8px;">${booking.user?.phone || booking.customerDetails?.phone || "N/A"}</td>
            </tr>
          </table>
        </div>

        <!-- Vehicle Details -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f59e0b; margin-bottom: 10px; border-left: 3px solid #f59e0b; padding-left: 10px;">🚗 Vehicle Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; width: 120px;">Vehicle Name</td>
              <td style="padding: 8px;">${booking.vehicle?.name || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Brand</td>
              <td style="padding: 8px;">${booking.vehicle?.brand || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Year</td>
              <td style="padding: 8px;">${booking.vehicle?.year || "N/A"}</td>
            </tr>
          </table>
        </div>

        <!-- Booking Details -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f59e0b; margin-bottom: 10px; border-left: 3px solid #f59e0b; padding-left: 10px;">📅 Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; width: 120px;">Pickup Date</td>
              <td style="padding: 8px;">${new Date(booking.startDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Return Date</td>
              <td style="padding: 8px;">${new Date(booking.endDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Total Days</td>
              <td style="padding: 8px;">${booking.totalDays} days</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Pickup Location</td>
              <td style="padding: 8px;">${booking.pickupLocation || "N/A"}</td>
            </tr>
          </table>
        </div>

        <!-- Price Breakdown -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f59e0b; margin-bottom: 10px; border-left: 3px solid #f59e0b; padding-left: 10px;">💰 Payment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Base Price</td>
              <td style="padding: 8px;">₹${(booking.pricePerDay * booking.totalDays).toLocaleString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Total Days</td>
              <td style="padding: 8px;">${booking.totalDays} days</td>
            </tr>
            <tr style="border-top: 2px solid #f59e0b; background: #fef3c7;">
              <td style="padding: 12px 8px; font-weight: bold; font-size: 16px;">Total Paid</td>
              <td style="padding: 12px 8px; font-size: 20px; font-weight: bold; color: #f59e0b;">₹${booking.finalAmount?.toLocaleString() || booking.totalAmount?.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <!-- Status -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f59e0b; margin-bottom: 10px; border-left: 3px solid #f59e0b; padding-left: 10px;">📊 Status</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; width: 120px;">Booking Status</td>
              <td style="padding: 8px;"><span style="background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px;">CONFIRMED ✅</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Payment Status</td>
              <td style="padding: 8px;"><span style="background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px;">PAID ✅</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Payment Date</td>
              <td style="padding: 8px;">${new Date(booking.paidAt || new Date()).toLocaleDateString("en-IN")}</td>
            </tr>
          </table>
        </div>

        <!-- Vendor Contact -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f59e0b; margin-bottom: 10px; border-left: 3px solid #f59e0b; padding-left: 10px;">🏪 Vendor Contact</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; width: 120px;">Vendor Name</td>
              <td style="padding: 8px;">${booking.vendorDetails?.businessName || booking.vendorDetails?.name || "Wheelz"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Phone</td>
              <td style="padding: 8px;">${booking.vendorDetails?.phone || "9876543210"}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>Thank you for choosing Wheelz!</p>
          <p>For any queries, contact us at support@wheelz.com | 9876543210</p>
          <p>This is a system generated receipt. No signature required.</p>
        </div>
      </div>
    `;

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Payment_Receipt_${booking.bookingRef}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(pdfContent).save();
    toast.success("Payment receipt downloaded successfully!");
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
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
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "bookings", label: "My Bookings", icon: CalendarIcon },
            { id: "wishlist", label: "Wishlist", icon: HeartIcon },
            { id: "profile", label: "Profile", icon: UserCircleIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg transition-all ${
                activeTab === tab.id
                  ? "bg-amber-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
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
                              {/* ✅ Only show download button if payment is done */}
                              {isPaid ? (
                                <button
                                  onClick={() => downloadBookingPDF(booking)}
                                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                                >
                                  <DocumentArrowDownIcon className="w-4 h-4" />
                                  Download Receipt
                                </button>
                              ) : (
                                <button
                                  onClick={() => processPayment(booking)}
                                  disabled={processingPayment}
                                  className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                                >
                                  <CreditCardIcon className="w-4 h-4" />
                                  {processingPayment
                                    ? "Processing..."
                                    : "Pay Now"}
                                </button>
                              )}
                              <button
                                onClick={() => viewBookingDetails(booking)}
                                className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                              >
                                <EyeIcon className="w-4 h-4" />
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {new Date(
                              booking.startDate,
                            ).toLocaleDateString()} -{" "}
                            {new Date(booking.endDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <TruckIcon className="w-4 h-4" />
                            {booking.pickupLocation}
                          </div>
                        </div>
                        {booking.status === "pending" &&
                          booking.paymentStatus !== "paid" && (
                            <button
                              onClick={() => cancelBooking(booking._id)}
                              className="mt-3 text-sm text-red-500 hover:text-red-600 transition-colors"
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
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
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
              className="mt-6 btn-primary"
            >
              Edit Profile
            </button>
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
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    Booking Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Booking ID: {selectedBooking.bookingRef}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedBooking.paymentStatus === "paid" && (
                    <button
                      onClick={() => downloadBookingPDF(selectedBooking)}
                      className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                      title="Download Receipt"
                    >
                      <DocumentArrowDownIcon className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Vehicle Details */}
                <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6">
                  <img
                    src={selectedBooking.vehicle?.images?.[0]}
                    alt={selectedBooking.vehicle?.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedBooking.vehicle?.name}
                    </h3>
                    <p className="text-gray-500">
                      {selectedBooking.vehicle?.brand} •{" "}
                      {selectedBooking.vehicle?.year}
                    </p>
                    <p className="text-amber-500 font-semibold mt-1">
                      ₹{selectedBooking.pricePerDay?.toLocaleString()}/day
                    </p>
                  </div>
                </div>

                {/* Booking Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Pickup Date</p>
                    <p className="font-medium">
                      {new Date(selectedBooking.startDate).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedBooking.pickupLocation}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Return Date</p>
                    <p className="font-medium">
                      {new Date(selectedBooking.endDate).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedBooking.dropoffLocation ||
                        selectedBooking.pickupLocation}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Price Breakdown
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per day</span>
                      <span>
                        ₹{selectedBooking.pricePerDay?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of days</span>
                      <span>{selectedBooking.totalDays} days</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total Amount</span>
                        <span className="text-amber-500 text-xl">
                          ₹
                          {selectedBooking.finalAmount?.toLocaleString() ||
                            selectedBooking.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Booking Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedBooking.status)}`}
                    >
                      {selectedBooking.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Payment Status</p>
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
