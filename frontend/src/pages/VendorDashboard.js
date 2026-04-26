import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { vehicleAPI, bookingAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  TruckIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function VendorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vehicles");

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      // ✅ FIXED: Use vendor-specific endpoints
      const [vehiclesRes, bookingsRes] = await Promise.all([
        vehicleAPI.getVendorVehicles(), // Only vendor's vehicles
        bookingAPI.getVendorBookings(), // Only vendor's bookings
      ]);

      const vendorVehicles = vehiclesRes.data.vehicles || [];
      const vendorBookings = bookingsRes.data.bookings || [];

      console.log("Vendor Vehicles:", vendorVehicles); // Debug log
      console.log("Vendor Bookings:", vendorBookings); // Debug log

      setVehicles(vendorVehicles);
      setBookings(vendorBookings);

      // Calculate stats
      const totalVehicles = vendorVehicles.length;
      const availableVehicles = vendorVehicles.filter(
        (v) => v.isAvailable,
      ).length;
      const totalBookings = vendorBookings.length;
      const completedBookings = vendorBookings.filter(
        (b) => b.status === "completed",
      ).length;
      const totalRevenue = vendorBookings.reduce(
        (sum, b) => sum + (b.totalAmount || 0),
        0,
      );
      const pendingAmount = vendorBookings
        .filter((b) => b.status === "pending")
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      setStats({
        totalVehicles,
        availableVehicles,
        totalBookings,
        completedBookings,
        totalRevenue,
        pendingAmount,
      });
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const toggleVehicleAvailability = async (vehicleId, currentStatus) => {
    try {
      await vehicleAPI.update(vehicleId, { isAvailable: !currentStatus });
      toast.success(
        `Vehicle ${!currentStatus ? "listed" : "unlisted"} successfully`,
      );
      fetchVendorData();
    } catch (error) {
      toast.error("Failed to update vehicle status");
    }
  };

  const deleteVehicle = async (vehicleId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this vehicle? This action cannot be undone.",
      )
    ) {
      try {
        await vehicleAPI.delete(vehicleId);
        toast.success("Vehicle deleted successfully");
        fetchVendorData();
      } catch (error) {
        toast.error("Failed to delete vehicle");
      }
    }
  };

  const statsCards = [
    {
      label: "Total Vehicles",
      value: stats?.totalVehicles || 0,
      icon: TruckIcon,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Available",
      value: stats?.availableVehicles || 0,
      icon: CheckCircleIcon,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: CalendarIcon,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Completed",
      value: stats?.completedBookings || 0,
      icon: ChartBarIcon,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Total Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: "from-red-500 to-red-600",
    },
    {
      label: "Pending Payout",
      value: `₹${(stats?.pendingAmount || 0).toLocaleString()}`,
      icon: ClockIcon,
      color: "from-orange-500 to-orange-600",
    },
  ];

  const revenueData = [
    { month: "Jan", revenue: 25000 },
    { month: "Feb", revenue: 35000 },
    { month: "Mar", revenue: 45000 },
    { month: "Apr", revenue: 55000 },
    { month: "May", revenue: 65000 },
    { month: "Jun", revenue: 75000 },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
      completed: "bg-blue-100 text-blue-700",
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Vendor Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your vehicles, track bookings, and monitor earnings
            </p>
          </div>
          <button
            onClick={() => navigate("/vendor/vehicles/add")}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Vehicle
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statsCards.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-amber-500" />
            Revenue Overview (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "vehicles", label: "My Vehicles", icon: TruckIcon },
            { id: "bookings", label: "Bookings", icon: CalendarIcon },
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

        {/* Vehicles Tab - Now shows ONLY vendor's vehicles */}
        {activeTab === "vehicles" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {vehicles.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
                <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Vehicles Listed
                </h3>
                <p className="text-gray-500 mb-4">
                  Start earning by listing your first vehicle!
                </p>
                <button
                  onClick={() => navigate("/vendor/vehicles/add")}
                  className="btn-primary inline-flex"
                >
                  Add Vehicle
                </button>
              </div>
            ) : (
              vehicles.map((vehicle, idx) => (
                <motion.div
                  key={vehicle._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={vehicle.images?.[0]}
                      alt={vehicle.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {vehicle.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {vehicle.brand} • {vehicle.year}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${vehicle.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                              {vehicle.isAvailable
                                ? "Available"
                                : "Not Available"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-amber-500">
                            ₹{vehicle.currentPrice?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">per day</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3">
                        <button
                          onClick={() => navigate(`/vehicles/${vehicle._id}`)}
                          className="text-sm text-amber-500 hover:text-amber-600 flex items-center gap-1"
                        >
                          <EyeIcon className="w-4 h-4" /> View
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/vendor/vehicles/edit/${vehicle._id}`)
                          }
                          className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                        >
                          <PencilIcon className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() =>
                            toggleVehicleAvailability(
                              vehicle._id,
                              vehicle.isAvailable,
                            )
                          }
                          className={`text-sm flex items-center gap-1 ${vehicle.isAvailable ? "text-red-500" : "text-green-500"}`}
                        >
                          {vehicle.isAvailable ? (
                            <XCircleIcon className="w-4 h-4" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4" />
                          )}
                          {vehicle.isAvailable ? "Unlist" : "List"}
                        </button>
                        <button
                          onClick={() => deleteVehicle(vehicle._id)}
                          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Bookings Tab - Shows ONLY vendor's bookings */}
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
                <p className="text-gray-500">
                  When customers book your vehicles, they'll appear here.
                </p>
              </div>
            ) : (
              bookings.map((booking, idx) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <img
                        src={booking.vehicle?.images?.[0]}
                        alt={booking.vehicle?.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
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
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-amber-500">
                        ₹{booking.totalAmount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">Total Amount</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {new Date(booking.startDate).toLocaleDateString()} -{" "}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Customer: {booking.user?.name || "Guest"}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
