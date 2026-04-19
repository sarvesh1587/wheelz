import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI, vehicleAPI, bookingAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  UsersIcon,
  TruckIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  BuildingStorefrontIcon,
  StarIcon,
  ChartBarIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
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
  AreaChart,
  Area,
} from "recharts";

const COLORS = [
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    brand: "",
    model: "",
    year: 2024,
    category: "car",
    fuelType: "petrol",
    transmission: "manual",
    seatingCapacity: 4,
    basePrice: 1000,
    locationName: "",
    city: "",
    images: ["https://via.placeholder.com/400x300?text=Vehicle"],
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, vehiclesRes, bookingsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllUsers(),
        vehicleAPI.getAll({ limit: 100 }),
        bookingAPI.getAll({ limit: 100 }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setVehicles(vehiclesRes.data.vehicles || []);
      setBookings(bookingsRes.data.bookings || []);

      // Filter vendors from users
      const vendorList = (usersRes.data.users || []).filter(
        (u) => u.role === "vendor",
      );
      setVendors(vendorList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.toggleUserActive(userId);
      fetchAllData();
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await vehicleAPI.delete(vehicleId);
        fetchAllData();
      } catch (error) {
        console.error("Error deleting vehicle:", error);
      }
    }
  };

  // const handleAddVehicle = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await vehicleAPI.create(newVehicle);
  //     setShowAddVehicleModal(false);
  //     setNewVehicle({
  //       name: "",
  //       brand: "",
  //       model: "",
  //       year: 2024,
  //       category: "car",
  //       fuelType: "petrol",
  //       transmission: "manual",
  //       seatingCapacity: 4,
  //       basePrice: 1000,
  //       locationName: "",
  //       city: "",
  //       images: ["https://via.placeholder.com/400x300?text=Vehicle"],
  //     });
  //     fetchAllData();
  //   } catch (error) {
  //     console.error("Error adding vehicle:", error);
  //   }
  // };
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      // Get current logged-in user from localStorage
      const userData = JSON.parse(localStorage.getItem("wheelz_user"));

      // Prepare vehicle data with vendor field
      const vehicleData = {
        ...newVehicle,
        vendor: userData?._id, // Add current user as vendor
        addedBy: userData?._id, // Add who added this vehicle
        isAvailable: true,
        currentPrice: newVehicle.basePrice,
      };

      console.log("Adding vehicle:", vehicleData); // Debug log

      await vehicleAPI.create(vehicleData);
      setShowAddVehicleModal(false);
      setNewVehicle({
        name: "",
        brand: "",
        model: "",
        year: 2024,
        category: "car",
        fuelType: "petrol",
        transmission: "manual",
        seatingCapacity: 4,
        basePrice: 1000,
        locationName: "",
        city: "",
        images: ["https://via.placeholder.com/400x300?text=Vehicle"],
      });
      fetchAllData();
      alert("Vehicle added successfully!");
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert(error.response?.data?.message || "Failed to add vehicle");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.city?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredBookings = bookings.filter(
    (b) =>
      b.bookingRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.vehicle?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return <LoadingSpinner />;

  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.finalAmount || 0), 0);
  const activeBookings = bookings.filter((b) =>
    ["confirmed", "active"].includes(b.status),
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "completed",
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your platform from one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm opacity-90">Total Users</p>
              </div>
              <UsersIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{vendors.length}</p>
                <p className="text-sm opacity-90">Vendors</p>
              </div>
              <BuildingStorefrontIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{vehicles.length}</p>
                <p className="text-sm opacity-90">Vehicles</p>
              </div>
              <TruckIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{bookings.length}</p>
                <p className="text-sm opacity-90">Bookings</p>
              </div>
              <CalendarIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  ₹{totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm opacity-90">Revenue</p>
              </div>
              <CurrencyRupeeIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "overview", label: "📊 Overview", icon: ChartBarIcon },
            { id: "users", label: "👥 Users", icon: UsersIcon },
            {
              id: "vendors",
              label: "🏪 Vendors",
              icon: BuildingStorefrontIcon,
            },
            { id: "vehicles", label: "🚗 Vehicles", icon: TruckIcon },
            { id: "bookings", label: "📅 Bookings", icon: CalendarIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-amber-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Revenue Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={[
                      { month: "Jan", revenue: 50000 },
                      { month: "Feb", revenue: 65000 },
                      { month: "Mar", revenue: 80000 },
                      { month: "Apr", revenue: 72000 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Booking Status
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Confirmed", value: activeBookings },
                        { name: "Completed", value: completedBookings },
                        {
                          name: "Cancelled",
                          value: bookings.filter(
                            (b) => b.status === "cancelled",
                          ).length,
                        },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                    >
                      {COLORS.map((color, i) => (
                        <Cell key={i} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl p-4 flex items-center gap-3 transition"
              >
                <PlusIcon className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-semibold">Add New Vehicle</p>
                  <p className="text-sm opacity-90">
                    Add car or bike to inventory
                  </p>
                </div>
              </button>
              <Link
                to="/admin/users"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-4 flex items-center gap-3 transition"
              >
                <UsersIcon className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-semibold">Manage Users</p>
                  <p className="text-sm opacity-90">
                    View all registered users
                  </p>
                </div>
              </Link>
              <Link
                to="/admin/vehicles"
                className="bg-green-500 hover:bg-green-600 text-white rounded-xl p-4 flex items-center gap-3 transition"
              >
                <TruckIcon className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-semibold">Manage Vehicles</p>
                  <p className="text-sm opacity-90">Edit or remove vehicles</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-700"
                              : user.role === "vendor"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role || "customer"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.isActive ? "Active" : "Blocked"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleToggleUserStatus(user._id, user.isActive)
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.isActive
                                ? "text-red-500 hover:bg-red-50"
                                : "text-green-500 hover:bg-green-50"
                            }`}
                          >
                            {user.isActive ? (
                              <XCircleIcon className="w-4 h-4" />
                            ) : (
                              <CheckCircleIcon className="w-4 h-4" />
                            )}
                          </button>
                          <button className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50">
                            <EyeIcon className="w-4 h-4" />
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

        {/* Vendors Tab */}
        {activeTab === "vendors" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vehicles
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
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {vendor.vendorDetails?.businessName || vendor.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {vendor.vendorDetails?.gstNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm">{vendor.email}</p>
                          <p className="text-sm text-gray-500">
                            {vendor.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {vendor.totalVehicles || 0} vehicles
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vendor.isVendorApproved
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {vendor.isVendorApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg text-green-500 hover:bg-green-50">
                            <CheckCircleIcon className="w-4 h-4" />
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

        {/* Vehicles Tab */}
        {activeTab === "vehicles" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition"
              >
                <PlusIcon className="w-4 h-4" />
                Add Vehicle
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Price/Day
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Location
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
                  {filteredVehicles.map((vehicle) => (
                    <tr
                      key={vehicle._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={vehicle.images?.[0]}
                            alt={vehicle.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {vehicle.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {vehicle.brand} {vehicle.model}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {vehicle.category}
                      </td>
                      <td className="px-6 py-4">₹{vehicle.basePrice}/day</td>
                      <td className="px-6 py-4">{vehicle.city}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.isAvailable
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {vehicle.isAvailable ? "Available" : "Booked"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(vehicle._id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                          >
                            <TrashIcon className="w-4 h-4" />
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

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4 font-mono text-sm">
                        {booking.bookingRef}
                      </td>
                      <td className="px-6 py-4">{booking.vehicle?.name}</td>
                      <td className="px-6 py-4">{booking.user?.name}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(booking.startDate).toLocaleDateString()} -{" "}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">₹{booking.finalAmount}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "completed"
                                ? "bg-blue-100 text-blue-700"
                                : booking.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Vehicle Modal */}
        {showAddVehicleModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddVehicleModal(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold">Add New Vehicle</h2>
              </div>
              <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newVehicle.name}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, name: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Brand"
                    value={newVehicle.brand}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, brand: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Model"
                    value={newVehicle.model}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, model: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Year"
                    value={newVehicle.year}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        year: parseInt(e.target.value),
                      })
                    }
                    className="input-field"
                    required
                  />
                  <select
                    value={newVehicle.category}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, category: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                  </select>
                  <select
                    value={newVehicle.fuelType}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, fuelType: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price per day"
                    value={newVehicle.basePrice}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        basePrice: parseInt(e.target.value),
                      })
                    }
                    className="input-field"
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newVehicle.city}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, city: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location Name"
                    value={newVehicle.locationName}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        locationName: e.target.value,
                      })
                    }
                    className="input-field col-span-2"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddVehicleModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
