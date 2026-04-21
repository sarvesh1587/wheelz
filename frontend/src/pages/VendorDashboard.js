import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { vehicleAPI, bookingAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  TruckIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  StarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function VendorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      // Fetch vendor's vehicles
      const vehiclesRes = await vehicleAPI.getAll({ limit: 100 });
      const vendorVehicles = vehiclesRes.data.vehicles.filter(
        (v) => v.vendor === user?._id,
      );
      setVehicles(vendorVehicles);

      // Fetch all bookings and filter vendor's
      const bookingsRes = await bookingAPI.getAll({ limit: 100 });
      const vendorBookings = bookingsRes.data.bookings.filter((b) =>
        vendorVehicles.some((v) => v._id === b.vehicle?._id),
      );
      setBookings(vendorBookings);

      // Calculate stats
      const totalEarnings = vendorBookings
        .filter((b) => b.paymentStatus === "paid")
        .reduce((sum, b) => sum + (b.finalAmount || 0), 0);

      setStats({
        totalVehicles: vendorVehicles.length,
        totalBookings: vendorBookings.length,
        totalEarnings: totalEarnings,
        averageRating:
          vendorVehicles.reduce((sum, v) => sum + (v.averageRating || 0), 0) /
            vendorVehicles.length || 0,
      });
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await vehicleAPI.delete(vehicleId);
        toast.success("Vehicle deleted successfully");
        fetchVendorData();
      } catch (error) {
        toast.error("Failed to delete vehicle");
      }
    }
  };

  const handleToggleAvailability = async (vehicleId, currentStatus) => {
    try {
      await vehicleAPI.update(vehicleId, { isAvailable: !currentStatus });
      toast.success(
        `Vehicle is now ${!currentStatus ? "available" : "unavailable"}`,
      );
      fetchVendorData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vendor Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, {user?.name?.split(" ")[0]}! Manage your vehicles and
            bookings.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.totalVehicles}</p>
                <p className="text-sm opacity-90">Total Vehicles</p>
              </div>
              <TruckIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
                <p className="text-sm opacity-90">Total Bookings</p>
              </div>
              <CalendarIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  ₹{stats.totalEarnings.toLocaleString()}
                </p>
                <p className="text-sm opacity-90">Total Earnings</p>
              </div>
              <CurrencyRupeeIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {stats.averageRating.toFixed(1)}★
                </p>
                <p className="text-sm opacity-90">Average Rating</p>
              </div>
              <StarIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "vehicles", label: "🚗 My Vehicles" },
            { id: "bookings", label: "📅 Bookings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-amber-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Bookings
                </h3>
                {bookings.slice(0, 5).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No bookings yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking._id}
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                      >
                        <div>
                          <p className="font-medium">{booking.vehicle?.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.startDate).toLocaleDateString()} -{" "}
                            {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-amber-500">
                            ₹{booking.finalAmount}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {booking.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/vendor/vehicles/add")}
                    className="w-full flex items-center gap-3 p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add New Vehicle</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("vehicles")}
                    className="w-full flex items-center gap-3 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition"
                  >
                    <TruckIcon className="w-5 h-5" />
                    <span>Manage My Vehicles</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="w-full flex items-center gap-3 p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition"
                  >
                    <CalendarIcon className="w-5 h-5" />
                    <span>View All Bookings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === "vehicles" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">My Vehicles ({vehicles.length})</h3>
              <button
                onClick={() => navigate("/vendor/vehicles/add")}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm"
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
                      Price/Day
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
                  {vehicles.map((vehicle) => (
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
                            <p className="font-medium">{vehicle.name}</p>
                            <p className="text-xs text-gray-500">
                              {vehicle.brand} {vehicle.model}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">₹{vehicle.basePrice}/day</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.isAvailable
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {vehicle.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(`/vendor/vehicles/edit/${vehicle._id}`)
                            }
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleAvailability(
                                vehicle._id,
                                vehicle.isAvailable,
                              )
                            }
                            className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded-lg"
                          >
                            {vehicle.isAvailable ? (
                              <XCircleIcon className="w-4 h-4" />
                            ) : (
                              <CheckCircleIcon className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(vehicle._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
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
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vehicle
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {bookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">
                            {booking.customerDetails?.name ||
                              booking.user?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.customerDetails?.phone ||
                              booking.user?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{booking.vehicle?.name}</td>
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
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/bookings/${booking._id}`}
                          className="text-blue-500 hover:underline text-sm"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
