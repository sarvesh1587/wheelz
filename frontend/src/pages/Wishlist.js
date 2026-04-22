import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { wishlistAPI } from "../services/api";
import VehicleCard from "../components/vehicle/VehicleCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { HeartIcon } from "@heroicons/react/24/outline";
import EmptyState from "../components/EmptyState";

export default function Wishlist() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistAPI
      .get()
      .then((res) => setVehicles(res.data.wishlist))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HeartIcon className="w-8 h-8 text-red-500" />
          My Wishlist
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      {vehicles.length === 0 ? (
        <EmptyState type="wishlist" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
