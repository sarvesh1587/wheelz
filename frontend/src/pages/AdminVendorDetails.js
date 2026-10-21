import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  CircleUser as UserCircleIcon,
  Truck as TruckIcon,
  Calendar as CalendarIcon,
  IndianRupee as CurrencyRupeeIcon,
  Store as BuildingStorefrontIcon,
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
  Mail as EnvelopeIcon,
  CheckCircle2 as CheckCircleIcon,
  XCircle as XCircleIcon,
  ArrowLeft as ArrowLeftIcon,
} from "lucide-react";
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
      // One call returns the vendor plus only their own vehicles and bookings.
      const vendorRes = await adminAPI.getUserById(id);
      setVendor(vendorRes.data.user);
      setVehicles(vendorRes.data.vehicles || []);
      setBookings(vendorRes.data.bookings || []);
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
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (!vendor) return null;

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="container-x">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/vendors")}
          className="flex items-center gap-2 text-muted hover:text-accent mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Vendors
        </button>

        {/* Vendor Profile Header */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-[24px] p-6 mb-8 border border-line/10"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="display grid h-24 w-24 shrink-0 place-items-center rounded-full bg-accent text-4xl text-accent-ink">
              {vendor.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow mb-3">Vendor profile</p>
                  <h1 className="display text-4xl md:text-6xl">
                    {vendor.name}
                  </h1>
                  <p className="text-muted">
                    {vendor.email}
                  </p>
                  {vendor.businessName && (
                    <p className="text-sm text-accent mt-1">
                      {vendor.businessName}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={toggleVendorStatus}
                    className={`${
                      vendor.isVendorApproved
                        ? "btn-ghost hover:!border-red-500 hover:!bg-transparent hover:!text-red-500"
                        : "btn-primary"
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
          <div className="bg-surface rounded-xl p-5 border border-line/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Total Vehicles</p>
                <p className="display-tight text-2xl text-ink">
                  {vehicles.length}
                </p>
              </div>
              <TruckIcon className="w-10 h-10 text-accent" />
            </div>
          </div>
          <div className="bg-surface rounded-xl p-5 border border-line/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Total Bookings</p>
                <p className="display-tight text-2xl text-ink">
                  {bookings.length}
                </p>
              </div>
              <CalendarIcon className="w-10 h-10 text-accent" />
            </div>
          </div>
          <div className="bg-surface rounded-xl p-5 border border-line/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Total Revenue</p>
                <p className="display text-2xl">
                  ₹
                  {bookings
                    .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
              <CurrencyRupeeIcon className="w-10 h-10 text-accent" />
            </div>
          </div>
          <div className="bg-surface rounded-xl p-5 border border-line/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Status</p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    vendor.isVendorApproved
                      ? "bg-raised text-accent"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  {vendor.isVendorApproved ? "Approved" : "Pending Approval"}
                </span>
              </div>
              {vendor.isVendorApproved ? (
                <CheckCircleIcon className="w-10 h-10 text-accent" />
              ) : (
                <XCircleIcon className="w-10 h-10 text-accent" />
              )}
            </div>
          </div>
        </div>

        {/* Vendor Vehicles */}
        <div className="bg-surface rounded-[24px] p-6 mb-8 border border-line/10">
          <h2 className="display-tight text-xl text-ink mb-4 flex items-center gap-2">
            <TruckIcon className="w-5 h-5 text-accent" />
            Vendor's Vehicles ({vehicles.length})
          </h2>
          {vehicles.length === 0 ? (
            <p className="text-muted text-center py-8">
              No vehicles listed yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="border border-line/10 rounded-xl p-4"
                >
                  <img
                    src={vehicle.images?.[0]}
                    alt={vehicle.name}
                    className="w-full h-32 object-cover rounded-xl mb-3"
                  />
                  <h3 className="font-semibold text-ink">
                    {vehicle.name}
                  </h3>
                  <p className="text-sm text-muted">
                    {vehicle.brand} • {vehicle.year}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="display text-lg">
                      ₹{vehicle.currentPrice}/day
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        vehicle.isAvailable
                          ? "bg-raised text-accent"
                          : "bg-accent/10 text-red-500"
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
        <div className="bg-surface rounded-[24px] p-6 border border-line/10">
          <h2 className="display-tight text-xl text-ink mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-accent" />
            Recent Bookings ({bookings.length})
          </h2>
          {bookings.length === 0 ? (
            <p className="text-muted text-center py-8">No bookings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-raised/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted">
                      Vehicle
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted">
                      Dates
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/10">
                  {bookings.slice(0, 10).map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-raised"
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
                              ? "bg-raised text-accent"
                              : booking.status === "pending"
                                ? "bg-accent/10 text-accent"
                                : "bg-accent/10 text-red-500"
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
