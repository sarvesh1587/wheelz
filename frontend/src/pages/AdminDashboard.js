import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI, vehicleAPI, bookingAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  UsersIcon,
  TruckIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // const fetchDashboardData = async () => {
  //   try {
  //     const [dashboardRes, usersRes, vendorsRes, vehiclesRes, bookingsRes] = await Promise.all([
  //       adminAPI.getDashboard(),
  //       adminAPI.getAllUsers({ role: "customer" }),
  //       adminAPI.getAllUsers({ role: "vendor" }),
  //       vehicleAPI.getAll({ limit: 100 }),
  //       bookingAPI.getAll({ limit: 100 }),
  //     ]);

  //     setDashboardData(dashboardRes.data);
  //     setUsers(usersRes.data.users || []);
  //     setVendors(vendorsRes.data.users || []);
  //     setDashboardData(prev => ({
  //       ...prev,
  //       totalVehicles: vehiclesRes.data.vehicles?.length || 0,
  //       totalBookings: bookingsRes.data.bookings?.length || 0,
  //     }));
  //   } catch (error) {
  //     console.error("Error fetching admin data:", error);
  //     toast.error("Failed to load dashboard");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // Update the fetchDashboardData function - change the vendors API call
  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, usersRes, vendorsRes, vehiclesRes, bookingsRes] =
        await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getAllUsers({ role: "customer" }), // ← Only customers
          adminAPI.getAllUsers({ role: "vendor" }), // ← Only vendors (FIXED)
          vehicleAPI.getAll({ limit: 100 }),
          bookingAPI.getAll({ limit: 100 }),
        ]);

      setDashboardData(dashboardRes.data);
      setUsers(usersRes.data.users || []);
      setVendors(vendorsRes.data.users || []); // ← Now only vendors
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
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.toggleUserActive(userId);
      toast.success(
        `User ${currentStatus ? "deactivated" : "activated"} successfully`,
      );
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to update user status");
    }
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
      label: "Total Revenue",
      value: `₹${(dashboardData?.totalRevenue || 0).toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: "from-red-500 to-red-600",
    },
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
            Manage users, vehicles, and monitor platform performance
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

          {/* Category Distribution */}
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
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "overview", label: "Overview", icon: ChartBarIcon },
            { id: "users", label: "Users", icon: UsersIcon },
            { id: "vendors", label: "Vendors", icon: BuildingStorefrontIcon },
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

        {/* Users List */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg"
          >
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
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {user.phone || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
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
                            toggleUserStatus(user._id, user.isActive)
                          }
                          className={`text-sm ${user.isActive ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"}`}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Vendors List */}
        {activeTab === "vendors" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg"
          >
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
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {vendor.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {vendor.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {vendor.businessName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {vendor.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
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
                        <button
                          onClick={() =>
                            navigate(`/admin/vendors/${vendor._id}`)
                          }
                          className="text-amber-500 hover:text-amber-600"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
