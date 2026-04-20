import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { vehicleAPI } from "../services/api";
import AdminVehicleCard from "../components/vehicle/AdminVehicleCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";

export default function AdminHome() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, available, unavailable
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    unavailable: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicleAPI.getAll({ limit: 100 });
      const vehiclesData = res.data.vehicles;
      setVehicles(vehiclesData);

      // Calculate stats
      const available = vehiclesData.filter((v) => v.isAvailable).length;
      const unavailable = vehiclesData.filter((v) => !v.isAvailable).length;
      const totalBookings = vehiclesData.reduce(
        (sum, v) => sum + (v.totalBookings || 0),
        0,
      );
      const totalRevenue = vehiclesData.reduce(
        (sum, v) => sum + (v.totalBookings || 0) * (v.basePrice || 0),
        0,
      );

      setStats({
        total: vehiclesData.length,
        available,
        unavailable,
        totalBookings,
        totalRevenue,
      });
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "available" && vehicle.isAvailable) ||
      (filter === "unavailable" && !vehicle.isAvailable);
    return matchesSearch && matchesFilter;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your vehicle fleet from one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm opacity-90">Total Vehicles</p>
              </div>
              <TruckIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.available}</p>
                <p className="text-sm opacity-90">Available</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.unavailable}</p>
                <p className="text-sm opacity-90">Unavailable</p>
              </div>
              <XCircleIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  ₹{stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm opacity-90">Total Revenue</p>
              </div>
              <CurrencyRupeeIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            to="/admin/vehicles/add"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Vehicle
          </Link>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-64"
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="all">All Vehicles</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
            </select>
          </div>
        </div>

        {/* Vehicles Grid */}
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
            <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No vehicles found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or add a new vehicle
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <AdminVehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                onVehicleUpdate={fetchVehicles}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
