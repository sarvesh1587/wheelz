import React, { useState, useEffect } from "react";
import { adminAPI, aiAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  UsersIcon,
  TruckIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
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

const COLORS = ["#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [fraudAlerts, setFraudAlerts] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [topVehicles, setTopVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getDashboard(), aiAPI.getFraudAlerts()])
      .then(([statsRes, fraudRes]) => {
        setStats(statsRes.data.stats);
        setFraudAlerts(fraudRes.data);
        setRecentBookings(statsRes.data.recentBookings);
        setTopVehicles(statsRes.data.topVehicles);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleResolveFraud = async (bookingId) => {
    try {
      await aiAPI.resolveFraudAlert(bookingId, { keepFlagged: false });
      setFraudAlerts((prev) => ({
        ...prev,
        flaggedBookings: prev.flaggedBookings.filter(
          (b) => b._id !== bookingId,
        ),
      }));
    } catch (err) {
      console.error("Failed to resolve fraud alert", err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!stats) return null;

  const chartData =
    stats.charts?.monthlyRevenue?.map((item) => ({
      month: `${item._id.month}/${item._id.year}`,
      revenue: item.revenue,
      bookings: item.count,
    })) || [];

  const statusData =
    stats.charts?.bookingsByStatus?.map((item) => ({
      name: item._id,
      value: item.count,
    })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Admin Dashboard
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Manage users, vehicles, and monitor fraud alerts
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Users",
            value: stats.users.total,
            icon: UsersIcon,
            color: "blue",
          },
          {
            label: "Total Vehicles",
            value: stats.vehicles.total,
            icon: TruckIcon,
            color: "green",
          },
          {
            label: "Active Bookings",
            value: stats.bookings.active,
            icon: CalendarIcon,
            color: "purple",
          },
          {
            label: "Total Revenue",
            value: `₹${(stats.revenue.total / 1000).toFixed(0)}K`,
            icon: CurrencyRupeeIcon,
            color: "amber",
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

      {/* Fraud Alerts */}
      {fraudAlerts?.flaggedBookings?.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 mb-8 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
              Fraud Alerts
            </h2>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {fraudAlerts.flaggedBookings.length}
            </span>
          </div>
          <div className="space-y-3">
            {fraudAlerts.flaggedBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {booking.vehicle?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    User: {booking.user?.name} ({booking.user?.email})
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    Flags: {booking.fraudFlags?.join(", ")}
                  </p>
                </div>
                <button
                  onClick={() => handleResolveFraud(booking._id)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Mark as Resolved
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Trend (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                name="Revenue (₹)"
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#10b981"
                name="Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Booking Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Vehicles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Top Performing Vehicles
          </h3>
          <div className="space-y-3">
            {topVehicles.map((vehicle, i) => (
              <div
                key={vehicle._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-amber-500">
                    #{i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {vehicle.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {vehicle.category} • {vehicle.totalBookings} bookings
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    ⭐ {vehicle.averageRating}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Recent Bookings
          </h3>
          <div className="space-y-3">
            {recentBookings.slice(0, 5).map((booking) => (
              <div
                key={booking._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {booking.vehicle?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    by {booking.user?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-500">
                    ₹{booking.finalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
