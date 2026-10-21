import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Pencil as PencilIcon,
  Trash2 as TrashIcon,
  BarChart3 as ChartBarIcon,
  Eye as EyeIcon,
  CheckCircle2 as CheckCircleIcon,
  XCircle as XCircleIcon,
  Truck as TruckIcon,
} from "lucide-react";
import { vehicleAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function AdminVehicleCard({ vehicle, onVehicleUpdate }) {
  const [loading, setLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${vehicle.name}"? This action cannot be undone.`,
      )
    ) {
      setLoading(true);
      try {
        await vehicleAPI.delete(vehicle._id);
        toast.success(`${vehicle.name} deleted successfully`);
        onVehicleUpdate();
      } catch (error) {
        toast.error("Failed to delete vehicle");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleAvailability = async () => {
    setLoading(true);
    try {
      await vehicleAPI.update(vehicle._id, {
        isAvailable: !vehicle.isAvailable,
      });
      toast.success(
        `${vehicle.name} is now ${!vehicle.isAvailable ? "available" : "unavailable"}`,
      );
      onVehicleUpdate();
    } catch (error) {
      toast.error("Failed to update availability");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Bookings",
      value: vehicle.totalBookings || 0,
      icon: ChartBarIcon,
    },
    {
      label: "Revenue Generated",
      value: `₹${((vehicle.totalBookings || 0) * (vehicle.basePrice || 0)).toLocaleString()}`,
      icon: TruckIcon,
    },
    {
      label: "Rating",
      value: `${vehicle.averageRating || 0}★`,
      icon: ChartBarIcon,
    },
  ];

  return (
    <div className="bg-surface rounded-[24px] overflow-hidden transition-all duration-300 border border-line/10">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            vehicle.images?.[0] ||
            "https://via.placeholder.com/400x300?text=No+Image"
          }
          alt={vehicle.name}
          className="w-full h-full object-cover"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-xl text-xs font-semibold ${
              vehicle.isAvailable
                ? "bg-ink text-canvas"
                : "bg-red-500 text-white"
            }`}
          >
            {vehicle.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        {/* Quick Stats Toggle */}
        <button
          onClick={() => setShowStats(!showStats)}
          className="absolute bottom-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-xl text-white hover:bg-black/70 transition"
        >
          <ChartBarIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="display-tight text-lg text-ink">
              {vehicle.name}
            </h3>
            <p className="text-sm text-muted">
              {vehicle.brand} {vehicle.model} • {vehicle.year}
            </p>
          </div>
          <div className="text-right">
            <p className="display text-2xl">
              ₹{vehicle.basePrice.toLocaleString()}
            </p>
            <p className="text-xs text-muted">/day</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted mb-3">
          <span>{vehicle.city}</span>
          <span>•</span>
          <span>
            {vehicle.averageRating?.toFixed(1) || 0} (
            {vehicle.totalReviews || 0})
          </span>
        </div>

        {/* Stats Popup */}
        {showStats && (
          <div className="mb-4 p-3 bg-raised/50 rounded-xl">
            <h4 className="font-semibold text-sm mb-2">Quick Stats</h4>
            <div className="grid grid-cols-3 gap-2">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon className="w-4 h-4 mx-auto text-muted mb-1" />
                  <p className="text-xs font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Link
            to={`/admin/vehicles/edit/${vehicle._id}`}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-ink text-canvas hover:bg-accent hover:text-accent-ink rounded-xl transition text-sm font-medium"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </Link>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition text-sm font-medium disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>

          <button
            onClick={handleToggleAvailability}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-accent hover:bg-ink hover:text-canvas text-accent-ink rounded-xl transition text-sm font-medium col-span-2"
          >
            {vehicle.isAvailable ? (
              <>
                <XCircleIcon className="w-4 h-4" />
                Mark Unavailable
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                Mark Available
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
