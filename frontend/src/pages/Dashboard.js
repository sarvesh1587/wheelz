import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import RazorpayButton from "../components/RazorpayButton";
import EmptyState from "../components/EmptyState";
import {
  CalendarIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        bookingAPI.getAll({ limit: 50 }),
        bookingAPI.getMyStats(),
      ]);
      setBookings(bookingsRes.data.bookings);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = (booking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedBooking(null);
    fetchData();
    toast.success("Payment successful! Booking confirmed.");
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setSelectedBooking(null);
    toast.error("Payment cancelled");
  };

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
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your bookings and account
        </p>
      </div>

      {/* Stats Cards */}
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
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
              <stat.icon className="w-8 h-8 text-amber-500/50" />
            </div>
          </div>
        ))}
      </div>

      {/* Bookings Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden">
        <div className="border-b px-6 py-4">
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

        <div className="divide-y">
          {filteredBookings.length === 0 ? (
            <EmptyState type="bookings" />
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
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
                      <p className="text-sm text-gray-500 mt-0.5">
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
                    <div className="flex gap-2 mt-2">
                      <Link
                        to={`/bookings/${booking._id}`}
                        className="text-xs text-amber-500 hover:underline"
                      >
                        View Details →
                      </Link>
                      {booking.status === "pending" &&
                        booking.paymentStatus === "pending" && (
                          <button
                            onClick={() => handlePaymentClick(booking)}
                            className="text-xs bg-amber-500 text-white px-2 py-1 rounded-lg hover:bg-amber-600"
                          >
                            Complete Payment
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Complete Payment
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Pay for your booking to confirm
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Vehicle</span>
                <span className="font-medium">
                  {selectedBooking.vehicle?.name}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Duration</span>
                <span>{selectedBooking.totalDays} days</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold text-amber-500 text-lg">
                  ₹{selectedBooking.finalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <RazorpayButton
              bookingId={selectedBooking._id}
              amount={selectedBooking.finalAmount}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />

            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
