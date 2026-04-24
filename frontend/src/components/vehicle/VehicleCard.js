import React from "react";
import { Link } from "react-router-dom";
import { HeartIcon, StarIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";
import { wishlistAPI } from "../../services/api";
import toast from "react-hot-toast";

const FUEL_COLORS = {
  petrol: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  diesel: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  electric:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  hybrid:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function VehicleCard({ vehicle, compact = false }) {
  const { isAuthenticated, isInWishlist, toggleWishlist } = useAuth();

  // ✅ Safety check - if vehicle is undefined, return null
  if (!vehicle) return null;

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please login to save vehicles");
      return;
    }
    try {
      await wishlistAPI.toggle(vehicle._id);
      toggleWishlist(vehicle._id);
      toast.success(
        isInWishlist(vehicle._id)
          ? "Removed from wishlist"
          : "Added to wishlist ❤️",
      );
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const inWishlist = isInWishlist(vehicle._id);
  const isPeakPrice = vehicle.currentPrice > vehicle.basePrice;

  // ✅ Safe access with optional chaining
  const fuelType = vehicle.fuelType || "petrol";
  const vehicleName = vehicle.name || "Vehicle";
  const vehicleYear = vehicle.year || "2024";
  const vehicleCity = vehicle.city || "Unknown";
  const totalReviews = vehicle.totalReviews || 0;
  const averageRating = vehicle.averageRating || 0;

  // ✅ Show discounted price if available
  const displayPrice =
    vehicle.discountedPrice || vehicle.currentPrice || vehicle.basePrice || 0;
  const originalPrice = vehicle.originalPrice || vehicle.basePrice || 0;
  const hasDiscount = vehicle.isDiscounted && vehicle.discountedPrice;

  return (
    <Link
      to={`/vehicles/${vehicle._id}`}
      className="group block bg-white dark:bg-gray-800/60 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 card-hover"
    >
      <div
        className="relative overflow-hidden"
        style={{ paddingBottom: compact ? "60%" : "66%" }}
      >
        <img
          src={
            vehicle.images?.[0] ||
            "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600"
          }
          alt={vehicleName}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* ✅ Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg animate-pulse">
              🔥 {vehicle.discountPercentage}% OFF
            </span>
          </div>
        )}

        <div
          className="absolute top-3 left-3 flex gap-1.5"
          style={{ left: hasDiscount ? 90 : 12 }}
        >
          <span
            className={`text-xs font-medium px-2 py-1 rounded-lg ${FUEL_COLORS[fuelType]}`}
          >
            {fuelType === "electric" && "⚡ "}
            {fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}
          </span>
          {isPeakPrice && (
            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-red-500/90 text-white">
              Peak 🔥
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-lg ${
              vehicle.isAvailable
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {vehicle.isAvailable ? "Available" : "Booked"}
          </span>
        </div>

        <button
          onClick={handleWishlist}
          className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
        >
          {inWishlist ? (
            <HeartSolid className="w-4 h-4 text-red-500" />
          ) : (
            <HeartIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight group-hover:text-amber-500 transition-colors">
            {vehicleName}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg">
            {vehicleYear}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <MapPinIcon className="w-3 h-3" />
          <span className="truncate">{vehicleCity}</span>
          {totalReviews > 0 && (
            <>
              <span className="mx-1">•</span>
              <StarIcon className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{averageRating.toFixed(1)}</span>
              <span className="text-gray-400">({totalReviews})</span>
            </>
          )}
        </div>

        {!compact && vehicle.specifications?.features?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {vehicle.specifications.features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-0.5 rounded-md"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {/* ✅ Price Section with Discount */}
        <div className="flex items-end justify-between">
          <div>
            {hasDiscount ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-red-500">
                    ₹{displayPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    ₹{originalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                    -{vehicle.discountPercentage}%
                  </span>
                </div>
                <span className="text-xs text-gray-500">/day</span>
              </>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{displayPrice.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">/day</span>
              </div>
            )}
            {isPeakPrice && !hasDiscount && (
              <p className="text-xs text-gray-400 line-through">
                ₹{originalPrice.toLocaleString()}
              </p>
            )}
          </div>

          {vehicle.isAvailable && (
            <span className="text-xs font-semibold text-amber-500 group-hover:underline">
              Book Now →
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
