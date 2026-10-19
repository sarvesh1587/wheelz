import React, { useState, useEffect } from "react";
import { wishlistAPI } from "../services/api";
import VehicleCard from "../components/vehicle/VehicleCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { PageHeader } from "../components/ui";

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
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader
        index="01"
        eyebrow={`${vehicles.length} vehicle${vehicles.length !== 1 ? "s" : ""} saved`}
        title={["Wishlist."]}
      />

      {vehicles.length === 0 ? (
        <EmptyState type="wishlist" />
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((vehicle, i) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
