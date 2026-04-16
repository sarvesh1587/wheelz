import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { bookingAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  CheckCircleIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export default function BookingSuccess() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingAPI
      .getOne(id)
      .then((res) => setBooking(res.data.booking))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!booking)
    return <div className="text-center py-20">Booking not found</div>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Booking Confirmed! 🎉
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Your booking has been confirmed. A confirmation email has been sent to
          your inbox.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Booking Reference
          </p>
          <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">
            {booking.bookingRef}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left mb-8">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-gray-500">Pickup Date</p>
              <p className="font-medium">
                {new Date(booking.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-gray-500">Return Date</p>
              <p className="font-medium">
                {new Date(booking.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPinIcon className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-gray-500">Pickup Location</p>
              <p className="font-medium">{booking.pickupLocation}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CurrencyRupeeIcon className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="font-medium text-lg text-amber-500">
                ₹{booking.finalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/dashboard" className="btn-primary flex-1 text-center">
            View My Bookings
          </Link>
          <Link to="/vehicles" className="btn-secondary flex-1 text-center">
            Browse More Vehicles
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Need help? Contact our 24/7 support at support@wheelz.com
        </p>
      </div>
    </div>
  );
}
