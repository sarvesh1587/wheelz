import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { bookingAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  CalendarIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  UserIcon,
  EnvelopeIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await bookingAPI.getOne(id);
      setBooking(res.data.booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error("Failed to load booking details");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!booking) return null;

  const vendorDetails = booking.vendorDetails;
  const customerDetails = booking.customerDetails;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Booking Details
        </h1>
        <p className="text-gray-500">Booking ID: {booking.bookingRef}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-amber-500" />
            Booking Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Vehicle</span>
              <span className="font-medium">{booking.vehicle?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  booking.status === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : booking.status === "completed"
                      ? "bg-blue-100 text-blue-700"
                      : booking.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {booking.status?.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Status</span>
              <span
                className={`font-medium ${
                  booking.paymentStatus === "paid"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {booking.paymentStatus === "paid" ? "✅ Paid" : "⏳ Pending"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-bold text-amber-500">
                ₹{booking.finalAmount?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-500" />
            Rental Period
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Pickup Date</span>
              <span>{new Date(booking.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Return Date</span>
              <span>{new Date(booking.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duration</span>
              <span>{booking.totalDays} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pickup Location</span>
              <span className="text-right">{booking.pickupLocation}</span>
            </div>
          </div>
        </div>

        {/* Vendor Details (Customer View) */}
        {vendorDetails && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BuildingStorefrontIcon className="w-5 h-5 text-blue-500" />
              Vendor Details (For Pickup)
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  {vendorDetails.businessName || vendorDetails.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <a
                  href={`tel:${vendorDetails.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {vendorDetails.phone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                <span>{vendorDetails.address}</span>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-amber-600">
                  📞 Please call vendor to coordinate pickup time
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Customer Details (Vendor View - only if admin or vendor) */}
        {customerDetails && booking.user?._id !== customerDetails.userId && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-green-500" />
              Customer Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span>{customerDetails.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <a
                  href={`tel:${customerDetails.phone}`}
                  className="text-blue-600"
                >
                  {customerDetails.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                <span>{customerDetails.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                <span>{customerDetails.address}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <Link to="/dashboard" className="btn-secondary">
          ← Back to Dashboard
        </Link>
        {booking.paymentStatus !== "paid" && (
          <button className="btn-primary">Complete Payment</button>
        )}
      </div>
    </div>
  );
}
