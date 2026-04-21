import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingAPI, vehicleAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  CalendarIcon,
  CurrencyRupeeIcon,
  UserIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

export default function VendorBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorBookings();
  }, []);

  const fetchVendorBookings = async () => {
    setLoading(true);
    try {
      // Get vendor's vehicles first
      const vehiclesRes = await vehicleAPI.getAll({ limit: 100 });
      const vendorVehicles = vehiclesRes.data.vehicles.filter(
        (v) => v.vendor === user?._id,
      );
      const vehicleIds = vendorVehicles.map((v) => v._id);

      // Get all bookings and filter
      const bookingsRes = await bookingAPI.getAll({ limit: 100 });
      const vendorBookings = bookingsRes.data.bookings.filter((b) =>
        vehicleIds.includes(b.vehicle?._id),
      );
      setBookings(vendorBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        My Bookings
      </h1>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
          <p className="text-gray-500">No bookings yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{booking.vehicle?.name}</h3>
                  <p className="text-sm text-gray-500">{booking.bookingRef}</p>
                </div>
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
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span>
                    {booking.customerDetails?.name || booking.user?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-gray-400" />
                  <span>{booking.customerDetails?.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span>
                    {new Date(booking.startDate).toLocaleDateString()} -{" "}
                    {new Date(booking.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CurrencyRupeeIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-amber-500">
                    ₹{booking.finalAmount}
                  </span>
                </div>
              </div>

              <Link
                to={`/bookings/${booking._id}`}
                className="mt-3 inline-block text-amber-500 text-sm hover:underline"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
