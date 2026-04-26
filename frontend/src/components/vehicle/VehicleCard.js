import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HeartIcon,
  StarIcon,
  MapPinIcon,
  BoltIcon,
  GasStationIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";
import { wishlistAPI } from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const FUEL_COLORS = {
  petrol: {
    bg: "bg-gradient-to-br from-orange-400/20 to-orange-500/10",
    text: "text-orange-400",
    icon: "🔥",
  },
  diesel: {
    bg: "bg-gradient-to-br from-gray-500/20 to-gray-600/10",
    text: "text-gray-400",
    icon: "⛽",
  },
  electric: {
    bg: "bg-gradient-to-br from-emerald-400/20 to-emerald-500/10",
    text: "text-emerald-400",
    icon: "⚡",
  },
  hybrid: {
    bg: "bg-gradient-to-br from-purple-400/20 to-purple-500/10",
    text: "text-purple-400",
    icon: "🔄",
  },
};

export default function VehicleCard({ vehicle, compact = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isAuthenticated, isInWishlist, toggleWishlist } = useAuth();

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
        { icon: "💝", style: { background: "#1a1a1a", color: "#fff" } },
      );
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const inWishlist = isInWishlist(vehicle._id);
  const isPeakPrice = vehicle.currentPrice > vehicle.basePrice;

  const fuelType = vehicle.fuelType || "petrol";
  const vehicleName = vehicle.name || "Vehicle";
  const vehicleYear = vehicle.year || "2024";
  const vehicleCity = vehicle.city || "Unknown";
  const totalReviews = vehicle.totalReviews || 0;
  const averageRating = vehicle.averageRating || 0;

  const displayPrice =
    vehicle.discountedPrice || vehicle.currentPrice || vehicle.basePrice || 0;
  const originalPrice = vehicle.originalPrice || vehicle.basePrice || 0;
  const hasDiscount = vehicle.isDiscounted && vehicle.discountedPrice;

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: {
      y: -12,
      transition: { duration: 0.3, type: "spring", stiffness: 300 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link to={`/vehicles/${vehicle._id}`} className="relative block group">
        {/* Glass Card Container */}
        <div className="relative bg-white/5 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 dark:border-gray-700/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Image Container with Parallax Effect */}
          <div
            className="relative overflow-hidden"
            style={{ paddingBottom: compact ? "60%" : "70%" }}
          >
            {/* Skeleton Loader */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
            )}

            <img
              src={
                vehicle.images?.[0] ||
                "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600"
              }
              alt={vehicleName}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                isHovered ? "scale-110 rotate-1" : "scale-100"
              } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />

            {/* Premium Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Shine Effect on Hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />

            {/* Fuel Badge - Premium Design */}
            <div className="absolute top-4 left-4 z-10">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md ${FUEL_COLORS[fuelType].bg} border border-white/20`}
              >
                <span className="text-sm">{FUEL_COLORS[fuelType].icon}</span>
                <span
                  className={`text-xs font-semibold ${FUEL_COLORS[fuelType].text}`}
                >
                  {fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}
                </span>
              </div>
            </div>

            {/* Availability Badge - Animated */}
            <div className="absolute top-4 right-4 z-10">
              <div
                className={`relative px-3 py-1.5 rounded-xl backdrop-blur-md ${
                  vehicle.isAvailable
                    ? "bg-emerald-500/80 shadow-lg shadow-emerald-500/30"
                    : "bg-red-500/80 shadow-lg shadow-red-500/30"
                } border border-white/30`}
              >
                <span className="text-xs font-bold text-white tracking-wide">
                  {vehicle.isAvailable ? "✨ Available" : "🔒 Booked"}
                </span>
                {vehicle.isAvailable && isHovered && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-300 rounded-full animate-ping" />
                )}
              </div>
            </div>

            {/* Peak Season Badge - Premium */}
            {isPeakPrice && (
              <div className="absolute bottom-4 left-4 z-10">
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500/90 to-orange-500/90 backdrop-blur-md border border-white/30 shadow-lg">
                  <span className="text-sm">🔥</span>
                  <span className="text-xs font-bold text-white">
                    Peak Season
                  </span>
                </div>
              </div>
            )}

            {/* Wishlist Button - Enhanced */}
            <motion.button
              onClick={handleWishlist}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full backdrop-blur-md bg-black/40 hover:bg-black/60 border border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl group/wishlist"
            >
              {inWishlist ? (
                <HeartSolid className="w-5 h-5 text-red-500 drop-shadow-lg" />
              ) : (
                <HeartIcon className="w-5 h-5 text-white/90 group-hover/wishlist:text-red-400 transition-colors" />
              )}
            </motion.button>

            {/* Quick View Overlay */}
            <div
              className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <button className="px-6 py-2.5 rounded-full bg-white text-gray-900 font-semibold text-sm transform transition-all duration-300 hover:scale-110 hover:shadow-2xl">
                Quick View ⟶
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="relative p-5">
            {/* Title & Year Row */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-pink-500 group-hover:bg-clip-text transition-all duration-300">
                {vehicleName}
              </h3>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                <CalendarIcon className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {vehicleYear}
                </span>
              </div>
            </div>

            {/* Location & Rating Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPinIcon className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate">{vehicleCity}</span>
              </div>

              {totalReviews > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r from-amber-400/10 to-orange-400/10">
                  <StarIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({totalReviews})
                  </span>
                </div>
              )}
            </div>

            {/* Features Chips */}
            {!compact && vehicle.specifications?.features?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {vehicle.specifications.features
                  .slice(0, 3)
                  .map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/70 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700"
                    >
                      {feature}
                    </span>
                  ))}
                {vehicle.specifications.features.length > 3 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{vehicle.specifications.features.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Price & Action Section */}
            <div className="flex items-end justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="space-y-1">
                {hasDiscount ? (
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        ₹{displayPrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ₹{originalPrice.toLocaleString()}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-lg">
                        -{vehicle.discountPercentage}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">per day</span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        ₹{displayPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">/day</span>
                    </div>
                  </div>
                )}
              </div>

              {vehicle.isAvailable && (
                <motion.div whileHover={{ x: 5 }} className="relative">
                  <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-xs shadow-lg hover:shadow-amber-500/50 transition-all duration-300 group/btn">
                    <span className="relative z-10">Book Now</span>
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  </button>
                </motion.div>
              )}
            </div>

            {/* Trust Badge - Shown on Hover */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-medium whitespace-nowrap"
            >
              ⭐ Free cancellation • Insurance included
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
