import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { vehicleAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  Plus as PlusIcon,
  Pencil as PencilIcon,
  Trash2 as TrashIcon,
  CheckCircle2 as CheckCircleIcon,
  XCircle as XCircleIcon,
} from "lucide-react";
import { PageHeader } from "../components/ui";
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
      const vendorVehicles = res.data.vehicles.filter(v => v.vendor === user?._id);
      setVehicles(vendorVehicles);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this vehicle?")) {
      try {
        await vehicleAPI.delete(id);
        toast.success("Deleted");
        fetchVehicles();
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await vehicleAPI.update(id, { isAvailable: !currentStatus });
      toast.success(`Vehicle is now ${!currentStatus ? "available" : "unavailable"}`);
      fetchVehicles();
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader
        index="01"
        eyebrow="Vendor"
        title={["My vehicles."]}
        actions={
          <button onClick={() => navigate("/vendor/vehicles/add")} className="btn-primary">
            <PlusIcon className="h-4 w-4" /> Add vehicle
          </button>
        }
      />

      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-[24px] border border-line/10">
          <p className="text-muted">No vehicles added yet.</p>
          <button onClick={() => navigate("/vendor/vehicles/add")} className="mt-2 text-accent">Add your first vehicle →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-surface rounded-[24px] overflow-hidden border border-line/10">
              <img src={vehicle.images?.[0]} alt={vehicle.name} className="h-48 w-full object-cover" />
              <div className="p-4">
                <h3 className="display-tight text-xl">{vehicle.name}</h3>
                <p className="text-muted text-sm">{vehicle.brand} {vehicle.model}</p>
                <p className="mt-2 font-mono text-sm">₹{vehicle.basePrice}/day</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => navigate(`/vendor/vehicles/edit/${vehicle._id}`)} className="chip flex-1 justify-center">Edit</button>
                  <button onClick={() => handleToggleAvailability(vehicle._id, vehicle.isAvailable)} className={`chip flex-1 justify-center ${vehicle.isAvailable ? "" : "!border-accent !text-accent"}`}>
                    {vehicle.isAvailable ? "Unavailable" : "Available"}
                  </button>
                  <button onClick={() => handleDelete(vehicle._id)} className="chip flex-1 justify-center hover:!border-red-500 hover:!text-red-500">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}