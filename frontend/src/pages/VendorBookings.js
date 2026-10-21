import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingAPI, vehicleAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  Calendar as CalendarIcon,
  IndianRupee as CurrencyRupeeIcon,
  User as UserIcon,
  Phone as PhoneIcon,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader, StatusPill } from "../components/ui";

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
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader index="01" eyebrow="Vendor" title={["Bookings."]} />

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-[24px] border border-line/10">
          <p className="text-muted">No bookings yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-surface rounded-[24px] p-6 border border-line/10"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="display-tight text-xl">{booking.vehicle?.name}</h3>
                  <p className="text-sm text-muted">{booking.bookingRef}</p>
                </div>
                <StatusPill status={booking.status} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-muted" />
                  <span>
                    {booking.customerDetails?.name || booking.user?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-muted" />
                  <span>{booking.customerDetails?.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted" />
                  <span>
                    {new Date(booking.startDate).toLocaleDateString()} -{" "}
                    {new Date(booking.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CurrencyRupeeIcon className="w-4 h-4 text-muted" />
                  <span className="font-mono text-ink">
                    ₹{booking.finalAmount}
                  </span>
                </div>
              </div>

              <Link
                to={`/bookings/${booking._id}`}
                className="link-underline mt-5 inline-flex items-center gap-1 text-sm"
              >
                View details <ArrowUpRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
