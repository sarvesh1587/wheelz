import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { vehicleAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  Plus as PlusIcon,
  Pencil as PencilIcon,
  Trash2 as TrashIcon,
  Search as MagnifyingGlassIcon,
  CheckCircle2 as CheckCircleIcon,
  XCircle as XCircleIcon,
} from "lucide-react";
import { PageHeader } from "../components/ui";
import toast from "react-hot-toast";

export default function AdminVehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicleAPI.getAll({ limit: 100 });
      setVehicles(res.data.vehicles);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await vehicleAPI.delete(vehicleId);
        toast.success("Vehicle deleted successfully");
        fetchVehicles();
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        toast.error("Failed to delete vehicle");
      }
    }
  };

  const handleToggleAvailability = async (vehicleId, currentStatus) => {
    try {
      await vehicleAPI.update(vehicleId, {
        isAvailable: !currentStatus,
      });
      toast.success(
        `Vehicle is now ${!currentStatus ? "available" : "unavailable"}`,
      );
      fetchVehicles();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error("Failed to update vehicle status");
    }
  };

  const handleEditVehicle = (vehicleId) => {
    navigate(`/admin/vehicles/edit/${vehicleId}`);
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.city?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader
        index="01"
        eyebrow="Admin"
        title={["Vehicles."]}
        lede="Add, edit, or remove vehicles from inventory."
        actions={
          <button onClick={() => navigate("/admin/vehicles/add")} className="btn-primary">
            <PlusIcon className="h-4 w-4" /> Add vehicle
          </button>
        }
      />

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-line/10 bg-surface"
          />
        </div>
      </div>

      {/* Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-[24px] border border-line/10">
          <p className="text-muted">No vehicles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className="bg-surface rounded-[24px] overflow-hidden transition-all duration-300 border border-line/10"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={
                    vehicle.images?.[0] ||
                    "https://via.placeholder.com/400x300?text=No+Image"
                  }
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
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
              </div>

              {/* Content */}
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

                <div className="flex items-center gap-2 text-sm text-muted mb-4">
                  <span>{vehicle.city}</span>
                  <span>•</span>
                  <span>{vehicle.averageRating?.toFixed(1) || 0}</span>
                </div>

                {/* Admin Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleEditVehicle(vehicle._id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-ink text-canvas hover:bg-accent hover:text-accent-ink rounded-xl transition text-sm font-medium"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteVehicle(vehicle._id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition text-sm font-medium"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>

                  <button
                    onClick={() =>
                      handleToggleAvailability(vehicle._id, vehicle.isAvailable)
                    }
                    className={`flex items-center justify-center gap-1 px-3 py-2 rounded-xl transition text-sm font-medium ${
                      vehicle.isAvailable
                        ? "bg-accent hover:bg-ink hover:text-canvas text-accent-ink"
                        : "bg-ink text-canvas hover:bg-accent hover:text-accent-ink"
                    }`}
                  >
                    {vehicle.isAvailable ? (
                      <>
                        <XCircleIcon className="w-4 h-4" />
                        Unavailable
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        Available
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
