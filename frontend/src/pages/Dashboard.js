import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingAPI, wishlistAPI, vehicleAPI } from "../services/api";
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
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");

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
              bookings.map((booking, idx) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all"
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
                            <span className="text-xs text-gray-400">
                              {new Date(booking.createdAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-amber-500">
                            ₹{booking.totalAmount?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">Total Amount</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(
                            booking.startDate,
                          ).toLocaleDateString()} -{" "}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <TruckIcon className="w-4 h-4" />
                          {booking.pickupLocation}
                        </div>
                      </div>
                      {booking.status === "pending" && (
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
              ))
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
    </div>
  );
}
