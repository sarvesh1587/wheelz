import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI, vehicleAPI, bookingAPI, kycAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  UsersIcon,
  TruckIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  XMarkIcon,
  IdentificationIcon, // ✅ Add this
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [kycSubmissions, setKycSubmissions] = useState([]); // ✅ Add this
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, allUsersRes, vehiclesRes, bookingsRes, kycRes] =
        await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getAllUsers(),
          vehicleAPI.getAll({ limit: 100 }),
          bookingAPI.getAll({ limit: 100 }),
          kycAPI.getAll({ status: "pending" }), // ✅ Get pending KYC
        ]);

      const allUsers = allUsersRes.data?.users || [];
      const customers = allUsers.filter((user) => user.role === "customer");
      const vendorsList = allUsers.filter((user) => user.role === "vendor");

      setDashboardData(dashboardRes.data);
      setUsers(customers);
      setVendors(vendorsList);
      setKycSubmissions(kycRes.data.kycs || []); // ✅ Set KYC submissions
      setDashboardData((prev) => ({
        ...prev,
        totalVehicles: vehiclesRes.data.vehicles?.length || 0,
        totalBookings: bookingsRes.data.bookings?.length || 0,
      }));
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // ✅ KYC Action Handlers
  const handleVerifyKYC = async (userId) => {
    try {
      await kycAPI.verify(userId);
      toast.success("KYC verified successfully");
      fetchDashboardData();
    } catch (error) {
      toast.error("Verification failed");
    }
  };

  const handleRejectKYC = async (userId) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      try {
        await kycAPI.reject(userId, reason);
        toast.success("KYC rejected");
        fetchDashboardData();
      } catch (error) {
        toast.error("Rejection failed");
      }
    }
  };

  const toggleVendorStatus = async (vendorId, currentStatus) => {
    try {
      await adminAPI.toggleUserActive(vendorId);
      toast.success(
        `Vendor ${currentStatus ? "deactivated" : "activated"} successfully`,
      );
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to update vendor status");
    }
  };

  const viewVendorDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowVendorModal(true);
  };

  const statsCards = [
    {
      label: "Total Users",
      value: users.length,
      icon: UsersIcon,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Vendors",
      value: vendors.length,
      icon: BuildingStorefrontIcon,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Total Vehicles",
      value: dashboardData?.totalVehicles || 0,
      icon: TruckIcon,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Total Bookings",
      value: dashboardData?.totalBookings || 0,
      icon: CalendarIcon,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Pending KYC",
      value: kycSubmissions.length,
      icon: IdentificationIcon,
      color: "from-yellow-500 to-yellow-600",
    }, // ✅ Added
    {
      label: "Active Bookings",
      value: dashboardData?.activeBookings || 0,
      icon: CheckCircleIcon,
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  const revenueData = [
    { month: "Jan", revenue: 120000 },
    { month: "Feb", revenue: 150000 },
    { month: "Mar", revenue: 180000 },
    { month: "Apr", revenue: 220000 },
    { month: "May", revenue: 250000 },
    { month: "Jun", revenue: 280000 },
  ];

  const categoryData = [
    { name: "Cars", value: 65, color: "#f59e0b" },
    { name: "Bikes", value: 35, color: "#10b981" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading admin dashboard...</p>
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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage users, vehicles, KYC, and monitor platform performance
          </p>
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-amber-500" />
              Revenue Overview
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

          {/* Vehicle Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-amber-500" />
              Vehicle Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: ChartBarIcon },
            { id: "kyc", label: "KYC Verification", icon: IdentificationIcon }, // ✅ Added KYC Tab
            { id: "users", label: "Users", icon: UsersIcon },
            { id: "vendors", label: "Vendors", icon: BuildingStorefrontIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg transition-all whitespace-nowrap ${
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

        {/* ✅ KYC Verification Tab */}
        {/* {activeTab === "kyc" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-b">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Pending KYC Submissions
                </h2>
                <p className="text-sm text-gray-500">
                  Review and verify user documents
                </p>
              </div>

              {kycSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <IdentificationIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    No Pending KYC
                  </h3>
                  <p className="text-gray-500">
                    All KYC submissions have been processed.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {kycSubmissions.map((kyc) => (
                    <div
                      key={kyc._id}
                      className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center font-bold text-amber-600">
                              {kyc.user?.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {kyc.user?.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {kyc.user?.email}
                              </p>
                            </div>
                            <span className="ml-auto text-xs text-gray-400">
                              Submitted:{" "}
                              {new Date(kyc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                            <div>
                              <span className="text-gray-500">
                                License Number:
                              </span>
                              <span className="ml-2 font-medium">
                                {kyc.licenseNumber}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Aadhaar Number:
                              </span>
                              <span className="ml-2 font-medium">
                                {kyc.aadhaarNumber}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-3 text-xs text-gray-400">
                            <span>
                              📄 DL Front:{" "}
                              {kyc.drivingLicenseFront?.split("/").pop()}
                            </span>
                            <span>
                              📄 DL Back:{" "}
                              {kyc.drivingLicenseBack?.split("/").pop()}
                            </span>
                            <span>
                              📄 Aadhaar Front:{" "}
                              {kyc.aadhaarFront?.split("/").pop()}
                            </span>
                            <span>
                              📄 Aadhaar Back:{" "}
                              {kyc.aadhaarBack?.split("/").pop()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyKYC(kyc.user._id)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Verify
                          </button>
                          <button
                            onClick={() => handleRejectKYC(kyc.user._id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )} */}
        {/* ✅ KYC Verification Tab with Image Previews */}
        {activeTab === "kyc" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-b">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Pending KYC Submissions
                </h2>
                <p className="text-sm text-gray-500">
                  Review and verify user documents
                </p>
              </div>

              {kycSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <IdentificationIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    No Pending KYC
                  </h3>
                  <p className="text-gray-500">
                    All KYC submissions have been processed.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {kycSubmissions.map((kyc) => (
                    <div
                      key={kyc._id}
                      className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center font-bold text-amber-600">
                              {kyc.user?.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {kyc.user?.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {kyc.user?.email}
                              </p>
                            </div>
                            <span className="ml-auto text-xs text-gray-400">
                              Submitted:{" "}
                              {new Date(kyc.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                            <div>
                              <span className="text-gray-500">
                                License Number:
                              </span>
                              <span className="ml-2 font-medium">
                                {kyc.licenseNumber}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Aadhaar Number:
                              </span>
                              <span className="ml-2 font-medium">
                                {kyc.aadhaarNumber}
                              </span>
                            </div>
                          </div>

                          {/* ✅ Image Previews */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            {/* Driving License Front */}
                            <div className="relative group">
                              <div className="text-xs text-gray-500 mb-1">
                                Driving License (Front)
                              </div>
                              {kyc.drivingLicenseFrontUrl ? (
                                <img
                                  src={kyc.drivingLicenseFrontUrl}
                                  alt="DL Front"
                                  className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() =>
                                    window.open(
                                      kyc.drivingLicenseFrontUrl,
                                      "_blank",
                                    )
                                  }
                                />
                              ) : (
                                <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>

                            {/* Driving License Back */}
                            <div>
                              <div className="text-xs text-gray-500 mb-1">
                                Driving License (Back)
                              </div>
                              {kyc.drivingLicenseBackUrl ? (
                                <img
                                  src={kyc.drivingLicenseBackUrl}
                                  alt="DL Back"
                                  className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() =>
                                    window.open(
                                      kyc.drivingLicenseBackUrl,
                                      "_blank",
                                    )
                                  }
                                />
                              ) : (
                                <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>

                            {/* Aadhaar Front */}
                            <div>
                              <div className="text-xs text-gray-500 mb-1">
                                Aadhaar (Front)
                              </div>
                              {kyc.aadhaarFrontUrl ? (
                                <img
                                  src={kyc.aadhaarFrontUrl}
                                  alt="Aadhaar Front"
                                  className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() =>
                                    window.open(kyc.aadhaarFrontUrl, "_blank")
                                  }
                                />
                              ) : (
                                <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>

                            {/* Aadhaar Back */}
                            <div>
                              <div className="text-xs text-gray-500 mb-1">
                                Aadhaar (Back)
                              </div>
                              {kyc.aadhaarBackUrl ? (
                                <img
                                  src={kyc.aadhaarBackUrl}
                                  alt="Aadhaar Back"
                                  className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() =>
                                    window.open(kyc.aadhaarBackUrl, "_blank")
                                  }
                                />
                              ) : (
                                <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyKYC(kyc.user._id)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Verify
                          </button>
                          <button
                            onClick={() => handleRejectKYC(kyc.user._id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
        {/* Users List Tab */}
        {activeTab === "users" && (
          // ... your existing users table code ...
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-sm">{user.phone || "-"}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            toggleVendorStatus(user._id, user.isActive)
                          }
                          className={`text-sm ${user.isActive ? "text-red-500" : "text-green-500"}`}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vendors List Tab */}
        {activeTab === "vendors" && (
          // ... your existing vendors table code ...
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Business Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {vendors.map((vendor) => (
                    <tr
                      key={vendor._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {vendor.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium">{vendor.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {vendor.businessName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">{vendor.email}</td>
                      <td className="px-6 py-4 text-sm">
                        {vendor.phone || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${vendor.isVendorApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {vendor.isVendorApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewVendorDetails(vendor)}
                            className="text-amber-500 hover:text-amber-600 text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              toggleVendorStatus(
                                vendor._id,
                                vendor.isVendorApproved,
                              )
                            }
                            className={`text-sm ${vendor.isVendorApproved ? "text-red-500" : "text-green-500"}`}
                          >
                            {vendor.isVendorApproved ? "Deactivate" : "Approve"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Vendor Details Modal */}
      <AnimatePresence>
        {showVendorModal && selectedVendor && (
          // ... your existing modal code ...
          <div>Modal Content</div>
        )}
      </AnimatePresence>
    </div>
  );
}
