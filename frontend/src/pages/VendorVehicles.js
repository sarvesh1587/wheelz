import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { vehicleAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function VendorVehicles() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicleAPI.getAll({ limit: 100 });
      const vendorVehicles = res.data.vehicles.filter(
        (v) => v.vendor === user?._id,
      );
      setVehicles(vendorVehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await vehicleAPI.delete(id);
        toast.success("Vehicle deleted");
        fetchVehicles();
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await vehicleAPI.update(id, { isAvailable: !currentStatus });
      toast.success(
        `Vehicle is now ${!currentStatus ? "available" : "unavailable"}`,
      );
      fetchVehicles();
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Vehicles
        </h1>
        <button
          onClick={() => navigate("/vendor/vehicles/add")}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" /> Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
          <p className="text-gray-500">No vehicles added yet.</p>
          <button
            onClick={() => navigate("/vendor/vehicles/add")}
            className="mt-3 text-amber-500"
          >
            Add your first vehicle →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg"
            >
              <img
                src={vehicle.images?.[0]}
                alt={vehicle.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg">{vehicle.name}</h3>
                <p className="text-gray-500 text-sm">
                  {vehicle.brand} {vehicle.model}
                </p>
                <p className="text-amber-500 font-bold mt-2">
                  ₹{vehicle.basePrice}/day
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() =>
                      navigate(`/vendor/vehicles/edit/${vehicle._id}`)
                    }
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleToggleAvailability(vehicle._id, vehicle.isAvailable)
                    }
                    className={`flex-1 py-2 rounded-lg ${vehicle.isAvailable ? "bg-yellow-500" : "bg-green-500"} text-white`}
                  >
                    {vehicle.isAvailable ? "Unavailable" : "Available"}
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle._id)}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg"
                  >
                    Delete
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
