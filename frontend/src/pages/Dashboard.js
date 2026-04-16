import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  CalendarIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const STATUS_STYLES = {
  pending: "badge-pending",
  confirmed: "badge-confirmed",
  active: "badge-confirmed",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
};

const STATUS_ICONS = {
  pending: <ClockIcon className="w-4 h-4" />,
  confirmed: <CheckCircleIcon className="w-4 h-4" />,
  completed: <CheckCircleIcon className="w-4 h-4" />,
  cancelled: <XCircleIcon className="w-4 h-4" />,
};

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    Promise.all([bookingAPI.getAll({ limit: 50 }), bookingAPI.getMyStats()])
      .then(([bookingsRes, statsRes]) => {
        setBookings(bookingsRes.data.bookings);
        setStats(statsRes.data.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "upcoming")
      return ["pending", "confirmed", "active"].includes(b.status);
    if (activeTab === "past")
      return ["completed", "cancelled"].includes(b.status);
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your bookings and account
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Bookings",
            value: stats?.totalBookings || 0,
            icon: CalendarIcon,
          },
          {
            label: "Active Rentals",
            value: stats?.activeBookings || 0,
            icon: ClockIcon,
          },
          {
            label: "Completed",
            value: stats?.completedBookings || 0,
            icon: CheckCircleIcon,
          },
          {
            label: "Total Spent",
            value: `₹${(stats?.totalSpent || 0).toLocaleString()}`,
            icon: CurrencyRupeeIcon,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.label}
                </p>
              </div>
              <stat.icon className="w-8 h-8 text-amber-500/50" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
          <div className="flex gap-4">
            {[
              { id: "upcoming", label: "Upcoming" },
              { id: "past", label: "Past" },
              { id: "all", label: "All Bookings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-gray-900"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500 dark:text-gray-400">
                No bookings found
              </p>
              <Link
                to="/vehicles"
                className="inline-block mt-4 text-amber-500 font-semibold hover:underline"
              >
                Browse Vehicles →
              </Link>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <img
                      src={booking.vehicle?.images?.[0]}
                      alt={booking.vehicle?.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {booking.vehicle?.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {booking.vehicle?.city}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {new Date(
                            booking.startDate,
                          ).toLocaleDateString()} -{" "}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </span>
                        <span>{booking.totalDays} days</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${STATUS_STYLES[booking.status]}`}
                      >
                        {STATUS_ICONS[booking.status]}
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                      ₹{booking.finalAmount.toLocaleString()}
                    </p>
                    <Link
                      to={`/bookings/${booking._id}`}
                      className="text-xs text-amber-500 hover:underline mt-1 inline-block"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
