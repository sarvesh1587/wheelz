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
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  DocumentTextIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
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
import html2pdf from "html2pdf.js";

export default function VendorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vehicles");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const [vehiclesRes, bookingsRes] = await Promise.all([
        vehicleAPI.getVendorVehicles(),
        bookingAPI.getVendorBookings(),
      ]);

      const vendorVehicles = vehiclesRes.data.vehicles || [];
      const vendorBookings = bookingsRes.data.bookings || [];

      console.log("Vendor Vehicles:", vendorVehicles);
      console.log("Vendor Bookings:", vendorBookings);

      setVehicles(vendorVehicles);
      setBookings(vendorBookings);

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

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  // PDF Download Function
  const downloadBookingPDF = () => {
    if (!selectedBooking) return;

    // Create a temporary div for PDF content
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
          <h2 style="margin: 10px 0 5px; color: #333;">Booking Confirmation</h2>
          <p style="color: #666; margin: 0;">Booking ID: ${selectedBooking.bookingRef}</p>
          <p style="color: #666; margin: 5px 0 0;">Date: ${new Date().toLocaleDateString("en-IN")}</p>
        </div>

        <!-- Customer Details -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f59e0b; margin-bottom: 10px; border-left: 3px solid #f59e0b; padding-left: 10px;">👤 Customer Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; width: 120px;">Full Name</td>
              <td style="padding: 8px;">${selectedBooking.user?.name || selectedBooking.customerDetails?.name || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Email</td>
              <td style="padding: 8px;">${selectedBooking.user?.email || selectedBooking.customerDetails?.email || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Phone</td>
              <td style="padding: 8px;">${selectedBooking.user?.phone || selectedBooking.customerDetails?.phone || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Address</td>
              <td style="padding: 8px;">${selectedBooking.customerDetails?.address || "Not provided"}</td>
            </tr>
          </table>
        </div>

        <!-- Vehicle Details -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f59e0b; margin-bottom: 10px; border-left: 3px solid #f59e0b; padding-left: 10px;">🚗 Vehicle Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; width: 120px;">Vehicle Name</td>
              <td style="padding: 8px;">${selectedBooking.vehicle?.name || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Brand</td>
              <td style="padding: 8px;">${selectedBooking.vehicle?.brand || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Year</td>
              <td style="padding: 8px;">${selectedBooking.vehicle?.year || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Price/Day</td>
              <td style="padding: 8px;">₹${selectedBooking.pricePerDay?.toLocaleString() || 0}</td>
            </tr>
          </table>
        </div>

        <!-- Booking Details -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f59e0b; margin-bottom: 10px; border-left: 3px solid #f59e0b; padding-left: 10px;">📅 Booking Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; width: 120px;">Pickup Date</td>
              <td style="padding: 8px;">${new Date(selectedBooking.startDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Return Date</td>
              <td style="padding: 8px;">${new Date(selectedBooking.endDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Total Days</td>
              <td style="padding: 8px;">${selectedBooking.totalDays} days</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Pickup Location</td>
              <td style="padding: 8px;">${selectedBooking.pickupLocation || "N/A"}</td>
            </tr>
          </table>
        </div>

        <!-- Price Breakdown -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f59e0b; margin-bottom: 10px; border-left: 3px solid #f59e0b; padding-left: 10px;">💰 Price Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Price per day</td>
              <td style="padding: 8px;">₹${selectedBooking.pricePerDay?.toLocaleString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Number of days</td>
              <td style="padding: 8px;">${selectedBooking.totalDays} days</td>
            </tr>
            ${
              selectedBooking.extras
                ? Object.entries(selectedBooking.extras)
                    .filter(([_, v]) => v)
                    .map(([key]) => {
                      const extraNames = {
                        insurance: "Zero Dep Insurance",
                        gps: "GPS Navigation",
                        childSeat: "Child Seat",
                        driver: "Professional Driver",
                      };
                      const extraPrices = {
                        insurance: 200,
                        gps: 100,
                        childSeat: 150,
                        driver: 500,
                      };
                      return `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px; padding-left: 20px; font-weight: bold;">• ${extraNames[key]}</td>
                  <td style="padding: 8px;">+₹${extraPrices[key]}/day</td>
                </tr>
              `;
                    })
                    .join("")
                : ""
            }
            <tr style="border-top: 2px solid #f59e0b;">
              <td style="padding: 12px 8px; font-weight: bold; font-size: 16px;">Total Amount</td>
              <td style="padding: 12px 8px; font-size: 20px; font-weight: bold; color: #f59e0b;">₹${selectedBooking.finalAmount?.toLocaleString() || selectedBooking.totalAmount?.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <!-- Status -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f59e0b; margin-bottom: 10px; border-left: 3px solid #f59e0b; padding-left: 10px;">📊 Status</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; width: 120px;">Booking Status</td>
              <td style="padding: 8px;"><span style="background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px;">${selectedBooking.status?.toUpperCase()}</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Payment Status</td>
              <td style="padding: 8px;"><span style="background: #fed7aa; color: #92400e; padding: 4px 12px; border-radius: 20px;">${selectedBooking.paymentStatus?.toUpperCase()}</span></td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>Thank you for choosing Wheelz!</p>
          <p>For any queries, contact us at support@wheelz.com | 9876543210</p>
          <p>This is a system generated document. No signature required.</p>
        </div>
      </div>
    `;

    // PDF options
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Booking_${selectedBooking.bookingRef}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    // Generate PDF
    html2pdf().set(opt).from(pdfContent).save();
    toast.success("PDF downloaded successfully!");
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

  const getPaymentStatusBadge = (status) => {
    const badges = {
      paid: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      refunded: "bg-red-100 text-red-700",
      failed: "bg-red-100 text-red-700",
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

        {/* Vehicles Tab */}
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
                  onClick={() => viewBookingDetails(booking)}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <img
                        src={booking.vehicle?.images?.[0]}
                        alt={booking.vehicle?.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors">
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
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-amber-500">
                        ₹{booking.totalAmount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <EyeIcon className="w-3 h-3" /> Click to view details
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {new Date(booking.startDate).toLocaleDateString()} -{" "}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      Customer:{" "}
                      {booking.user?.name ||
                        booking.customerDetails?.name ||
                        "Guest"}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {showBookingModal && selectedBooking && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
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
                  {/* PDF Download Button */}
                  <button
                    onClick={downloadBookingPDF}
                    className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center gap-1"
                    title="Download PDF"
                  >
                    <DocumentArrowDownIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Customer Details Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-amber-500" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <UserIcon className="w-4 h-4" />
                        <span className="text-xs">Full Name</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedBooking.user?.name ||
                          selectedBooking.customerDetails?.name ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <EnvelopeIcon className="w-4 h-4" />
                        <span className="text-xs">Email Address</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedBooking.user?.email ||
                          selectedBooking.customerDetails?.email ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <PhoneIcon className="w-4 h-4" />
                        <span className="text-xs">Phone Number</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedBooking.user?.phone ||
                          selectedBooking.customerDetails?.phone ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="text-xs">Address</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedBooking.customerDetails?.address ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Details Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TruckIcon className="w-5 h-5 text-amber-500" />
                    Vehicle Information
                  </h3>
                  <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <img
                      src={selectedBooking.vehicle?.images?.[0]}
                      alt={selectedBooking.vehicle?.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {selectedBooking.vehicle?.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {selectedBooking.vehicle?.brand} •{" "}
                        {selectedBooking.vehicle?.year}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Price:</span>
                          <span className="font-medium text-amber-500">
                            ₹{selectedBooking.pricePerDay?.toLocaleString()}/day
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-amber-500" />
                    Booking Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">
                        Pickup Location
                      </p>
                      <p className="font-medium">
                        {selectedBooking.pickupLocation}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Total Days</p>
                      <p className="font-medium">
                        {selectedBooking.totalDays} days
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CurrencyRupeeIcon className="w-5 h-5 text-amber-500" />
                    Price Breakdown
                  </h3>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Price per day
                        </span>
                        <span className="font-medium">
                          ₹{selectedBooking.pricePerDay?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Number of days
                        </span>
                        <span className="font-medium">
                          {selectedBooking.totalDays} days
                        </span>
                      </div>
                      {selectedBooking.extras &&
                        Object.entries(selectedBooking.extras).map(
                          ([key, value]) => {
                            if (!value) return null;
                            const extraNames = {
                              insurance: "Zero Dep Insurance",
                              gps: "GPS Navigation",
                              childSeat: "Child Seat",
                              driver: "Professional Driver",
                            };
                            const extraPrices = {
                              insurance: 200,
                              gps: 100,
                              childSeat: 150,
                              driver: 500,
                            };
                            return (
                              <div
                                key={key}
                                className="flex justify-between pl-4"
                              >
                                <span className="text-gray-500 text-sm">
                                  • {extraNames[key]}
                                </span>
                                <span className="text-gray-500 text-sm">
                                  +₹{extraPrices[key]}/day
                                </span>
                              </div>
                            );
                          },
                        )}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 dark:text-white">
                            Total Amount
                          </span>
                          <span className="text-2xl font-bold text-amber-500">
                            ₹
                            {selectedBooking.finalAmount?.toLocaleString() ||
                              selectedBooking.totalAmount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Section */}
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
                  {selectedBooking.notes && (
                    <div className="col-span-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">
                        Customer Notes
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedBooking.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
