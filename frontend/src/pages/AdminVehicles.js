import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { vehicleAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
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
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Vehicles
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add, edit, or remove vehicles from inventory
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/vehicles/add")}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Vehicle
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
          <p className="text-gray-500">No vehicles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
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
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      vehicle.isAvailable
                        ? "bg-green-500 text-white"
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
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {vehicle.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {vehicle.brand} {vehicle.model} • {vehicle.year}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-500">
                      ₹{vehicle.basePrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">/day</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <span>📍 {vehicle.city}</span>
                  <span>•</span>
                  <span>⭐ {vehicle.averageRating?.toFixed(1) || 0}</span>
                </div>

                {/* Admin Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleEditVehicle(vehicle._id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm font-medium"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteVehicle(vehicle._id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm font-medium"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>

                  <button
                    onClick={() =>
                      handleToggleAvailability(vehicle._id, vehicle.isAvailable)
                    }
                    className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition text-sm font-medium ${
                      vehicle.isAvailable
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
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
