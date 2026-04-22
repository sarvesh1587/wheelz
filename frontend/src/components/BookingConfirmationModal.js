import React from "react";
import { Link } from "react-router-dom";
import {
  XMarkIcon,
  CheckCircleIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

export default function BookingConfirmationModal({ booking, onClose }) {
  if (!booking) return null;

  const vendorDetails = booking.vendorDetails;
  const vehicle = booking.vehicle;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Booking Confirmed!
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
            <p className="text-green-700 dark:text-green-400 font-medium">
              🎉 Your booking has been confirmed successfully!
            </p>
            <p className="text-sm text-green-600 dark:text-green-500 mt-1">
              A confirmation email has been sent to your inbox.
            </p>
          </div>

          {/* Booking Reference */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Booking Reference
            </p>
            <p className="text-xl font-mono font-bold text-amber-500">
              {booking.bookingRef}
            </p>
          </div>

          {/* Vehicle Details */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <TruckIcon className="w-5 h-5 text-amber-500" />
              Vehicle Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Vehicle Name</p>
                <p className="font-medium">{vehicle?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Brand</p>
                <p className="font-medium">{vehicle?.brand}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Year</p>
                <p>{vehicle?.year}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fuel Type</p>
                <p className="capitalize">{vehicle?.fuelType}</p>
              </div>
            </div>
          </div>

          {/* Rental Period */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-500" />
              Rental Period
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Pickup Date</p>
                <p className="font-medium">
                  {new Date(booking.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Return Date</p>
                <p className="font-medium">
                  {new Date(booking.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p>{booking.totalDays} days</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pickup Location</p>
                <p className="text-sm">{booking.pickupLocation}</p>
              </div>
            </div>
          </div>

          {/* Vendor Contact (If available) */}
          {vendorDetails && (
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-amber-500" />
                Vendor Contact
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="text-xs text-gray-500">Vendor:</span>{" "}
                  {vendorDetails.businessName || vendorDetails.name}
                </p>
                <p>
                  <span className="text-xs text-gray-500">Phone:</span>{" "}
                  <a
                    href={`tel:${vendorDetails.phone}`}
                    className="text-blue-500"
                  >
                    {vendorDetails.phone}
                  </a>
                </p>
                <p>
                  <span className="text-xs text-gray-500">Address:</span>{" "}
                  {vendorDetails.address}
                </p>
              </div>
            </div>
          )}

          {/* Price Summary */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CurrencyRupeeIcon className="w-5 h-5 text-amber-500" />
              Payment Summary
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <span>Total Amount</span>
                <span className="font-bold text-amber-500">
                  ₹{booking.finalAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Status</span>
                <span className="text-green-600">Paid ✓</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Link
              to="/dashboard"
              onClick={onClose}
              className="flex-1 btn-primary text-center"
            >
              View My Bookings
            </Link>
            <button onClick={onClose} className="flex-1 btn-secondary">
              Close
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Need help? Contact support at support@wheelz.com
          </p>
        </div>
      </div>
    </div>
  );
}
