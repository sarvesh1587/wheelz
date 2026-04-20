import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  TruckIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function AdminHome() {
  const { user } = useAuth();

  const quickActions = [
    {
      to: "/admin/vehicles",
      label: "Manage Vehicles",
      icon: TruckIcon,
      color: "bg-blue-500",
    },
    {
      to: "/admin/users",
      label: "Manage Users",
      icon: UsersIcon,
      color: "bg-green-500",
    },
    {
      to: "/admin/vehicles/add",
      label: "Add New Vehicle",
      icon: PlusIcon,
      color: "bg-purple-500",
    },
    {
      to: "/admin",
      label: "View Analytics",
      icon: ChartBarIcon,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Hero Section */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold">
              👑
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Welcome back, {user?.name?.split(" ")[0]}!
              </h1>
              <p className="text-white/80 mt-1">
                You have full control over Wheelz platform. Manage vehicles,
                users, and track performance.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-2xl font-bold">150+</p>
              <p className="text-sm opacity-80">Total Vehicles</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-2xl font-bold">1.2K+</p>
              <p className="text-sm opacity-80">Total Users</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-2xl font-bold">₹12.5L</p>
              <p className="text-sm opacity-80">Total Revenue</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-2xl font-bold">850+</p>
              <p className="text-sm opacity-80">Bookings</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.to}
                className={`${action.color} rounded-2xl p-5 text-white hover:shadow-lg transition-all hover:scale-105 group`}
              >
                <action.icon className="w-8 h-8 mb-3 opacity-90" />
                <h3 className="font-semibold text-lg">{action.label}</h3>
                <p className="text-white/70 text-sm mt-1 group-hover:flex hidden items-center gap-1">
                  Click to manage <ArrowRightIcon className="w-3 h-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity / Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span>💡</span> Admin Tips
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
            <li>
              • • Use the "Manage Vehicles" section to add, edit, or remove
              vehicles
            </li>
            <li>
              • • Track platform performance using the Analytics Dashboard
            </li>
            <li>• • New vendor registrations require admin approval</li>
            <li>• • Monitor bookings and revenue from the dashboard charts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
