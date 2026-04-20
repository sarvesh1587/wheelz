import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { vehicleAPI, adminAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import AdminVehicleCard from "../components/vehicle/AdminVehicleCard";
import {
  UsersIcon,
  TruckIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  BuildingStorefrontIcon,
  PlusIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

export default function AdminHomepage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingVendors: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch featured vehicles
      const vehiclesRes = await vehicleAPI.getAll({
        sort: "popular",
        limit: 6,
      });
      setFeaturedVehicles(vehiclesRes.data.vehicles);

      // Fetch stats
      const dashboardRes = await adminAPI.getDashboard();
      const usersRes = await adminAPI.getAllUsers();

      const vendors = (usersRes.data.users || []).filter(
        (u) => u.role === "vendor" && !u.isVendorApproved,
      );

      setStats({
        totalUsers: dashboardRes.data.stats?.users?.total || 0,
        totalVehicles: dashboardRes.data.stats?.vehicles?.total || 0,
        totalBookings: dashboardRes.data.stats?.bookings?.total || 0,
        totalRevenue: dashboardRes.data.stats?.revenue?.total || 0,
        pendingVendors: vendors.length,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      to: "/admin/vehicles/add",
      label: "Add Vehicle",
      icon: PlusIcon,
      color: "bg-amber-500",
      description: "Add new car or bike to inventory",
    },
    {
      to: "/admin/vehicles",
      label: "Manage Vehicles",
      icon: TruckIcon,
      color: "bg-blue-500",
      description: "Edit, delete or update vehicle status",
    },
    {
      to: "/admin/users",
      label: "Manage Users",
      icon: UsersIcon,
      color: "bg-green-500",
      description: "View and manage all users",
    },
    {
      to: "/admin/vendors",
      label: "Vendors",
      icon: BuildingStorefrontIcon,
      color: "bg-purple-500",
      description: `${stats.pendingVendors} pending approvals`,
    },
  ];

  const statsCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: UsersIcon,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Vehicles",
      value: stats.totalVehicles,
      icon: TruckIcon,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: CalendarIcon,
      color: "from-orange-500 to-orange-600",
    },
    {
      label: "Total Revenue",
      value: `₹${(stats.totalRevenue / 1000).toFixed(0)}K`,
      icon: CurrencyRupeeIcon,
      color: "from-green-500 to-green-600",
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Hero Section */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                  👑
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Welcome back, {user?.name?.split(" ")[0]}!
                </h1>
              </div>
              <p className="text-white/80 text-lg">
                Here's what's happening with your platform today.
              </p>
            </div>
            <Link
              to="/admin/vehicles/add"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-2.5 rounded-xl transition flex items-center gap-2 font-semibold text-sm"
            >
              <PlusIcon className="w-5 h-5" />
              Add New Vehicle
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r ${stat.color} rounded-2xl p-4 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs opacity-90 mt-1">{stat.label}</p>
                </div>
                <stat.icon className="w-8 h-8 opacity-80" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.to}
                className={`${action.color} rounded-2xl p-5 text-white hover:shadow-xl transition-all hover:scale-105 group`}
              >
                <action.icon className="w-8 h-8 mb-3 opacity-90" />
                <h3 className="font-semibold text-lg">{action.label}</h3>
                <p className="text-white/70 text-sm mt-1">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Vehicles Section with Admin Controls */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span>⭐</span> Featured Vehicles
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Most popular vehicles - manage them directly from here
              </p>
            </div>
            <Link
              to="/admin/vehicles"
              className="text-amber-500 hover:text-amber-600 text-sm font-medium flex items-center gap-1"
            >
              View All Vehicles
              <ArrowTrendingUpIcon className="w-4 h-4" />
            </Link>
          </div>

          {featuredVehicles.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
              <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                No vehicles found. Add your first vehicle!
              </p>
              <Link
                to="/admin/vehicles/add"
                className="inline-block mt-3 text-amber-500 hover:underline"
              >
                + Add Vehicle
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <AdminVehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  onVehicleUpdate={fetchData}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity / Tips */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-amber-500" />
              Admin Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                • • New vehicle listings appear on homepage within minutes
              </li>
              <li>• • Use "Mark Unavailable" for vehicles under maintenance</li>
              <li>• • Vendor registrations require your approval</li>
              <li>• • Check analytics dashboard for revenue insights</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckBadgeIcon className="w-5 h-5 text-green-500" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Pending Vendor Approvals
                </span>
                <span className="font-semibold text-amber-500">
                  {stats.pendingVendors}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Total Bookings This Month
                </span>
                <span className="font-semibold text-amber-500">
                  {stats.totalBookings}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="font-semibold text-amber-500">4.8 ★</span>
              </div>
            </div>
            <Link
              to="/admin"
              className="mt-4 inline-block text-sm text-amber-500 hover:underline"
            >
              View Full Analytics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
