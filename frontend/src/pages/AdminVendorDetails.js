import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI, vehicleAPI, bookingAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  UserCircleIcon,
  TruckIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export default function AdminVendorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      // Fetch vendor details
      const vendorRes = await adminAPI.getUserById(id);
      setVendor(vendorRes.data.user);

      // Fetch vendor's vehicles
      const vehiclesRes = await vehicleAPI.getAll({ vendorId: id });
      setVehicles(vehiclesRes.data.vehicles || []);

      // Fetch vendor's bookings
      const bookingsRes = await bookingAPI.getAll({ vendorId: id });
      setBookings(bookingsRes.data.bookings || []);
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      toast.error("Failed to load vendor details");
      navigate("/admin/vendors");
    } finally {
      setLoading(false);
    }
  };

  const toggleVendorStatus = async () => {
    try {
      await adminAPI.toggleVendorStatus(id, !vendor?.isVendorApproved);
      toast.success(
        `Vendor ${vendor?.isVendorApproved ? "deactivated" : "approved"} successfully`,
      );
      fetchVendorDetails();
    } catch (error) {
      toast.error("Failed to update vendor status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (!vendor) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/vendors")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-500 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Vendors
        </button>

        {/* Vendor Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">
              {vendor.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {vendor.name}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    {vendor.email}
                  </p>
                  {vendor.businessName && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                      {vendor.businessName}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={toggleVendorStatus}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      vendor.isVendorApproved
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {vendor.isVendorApproved
                      ? "Deactivate Vendor"
                      : "Approve Vendor"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vehicles.length}
                </p>
              </div>
              <TruckIcon className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bookings.length}
                </p>
              </div>
              <CalendarIcon className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹
                  {bookings
                    .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
              <CurrencyRupeeIcon className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    vendor.isVendorApproved
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {vendor.isVendorApproved ? "Approved" : "Pending Approval"}
                </span>
              </div>
              {vendor.isVendorApproved ? (
                <CheckCircleIcon className="w-10 h-10 text-green-500" />
              ) : (
                <XCircleIcon className="w-10 h-10 text-yellow-500" />
              )}
            </div>
          </div>
        </div>

        {/* Vendor Vehicles */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TruckIcon className="w-5 h-5 text-amber-500" />
            Vendor's Vehicles ({vehicles.length})
          </h2>
          {vehicles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No vehicles listed yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                >
                  <img
                    src={vehicle.images?.[0]}
                    alt={vehicle.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {vehicle.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {vehicle.brand} • {vehicle.year}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-amber-500">
                      ₹{vehicle.currentPrice}/day
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        vehicle.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {vehicle.isAvailable ? "Available" : "Not Available"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-500" />
            Recent Bookings ({bookings.length})
          </h2>
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Vehicle
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Dates
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {bookings.slice(0, 10).map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-4 py-3 text-sm">
                        {booking.vehicle?.name}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {booking.user?.name || "Guest"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(booking.startDate).toLocaleDateString()} -{" "}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        ₹{booking.totalAmount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
