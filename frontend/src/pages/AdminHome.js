import React from "react";
import { Link } from "react-router-dom";
import {
  TruckIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome to Admin Panel - Manage your platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">150+</p>
                <p className="text-sm opacity-90">Total Vehicles</p>
              </div>
              <TruckIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">1,250+</p>
                <p className="text-sm opacity-90">Total Users</p>
              </div>
              <UsersIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">₹12.5L</p>
                <p className="text-sm opacity-90">Total Revenue</p>
              </div>
              <CurrencyRupeeIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">850+</p>
                <p className="text-sm opacity-90">Bookings</p>
              </div>
              <ChartBarIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/admin/vehicles"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <TruckIcon className="w-8 h-8 text-amber-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Manage Vehicles
            </h3>
            <p className="text-gray-500 text-sm">
              Add, edit, or remove vehicles from inventory
            </p>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <UsersIcon className="w-8 h-8 text-amber-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Manage Users
            </h3>
            <p className="text-gray-500 text-sm">
              View and manage all registered users
            </p>
          </Link>
        </div>

        {/* Admin Info */}
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            👑 You are logged in as Admin. You can manage vehicles, users, and
            view analytics from here.
          </p>
        </div>
      </div>
    </div>
  );
}
