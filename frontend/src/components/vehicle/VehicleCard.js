import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HeartIcon,
  StarIcon,
  MapPinIcon,
  BoltIcon,
  FireIcon,
  CalendarIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";
import { wishlistAPI } from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

// Neutral, consistent fuel styling. Electric gets the one accent (emerald),
// everything else stays quiet so the card doesn't compete with itself.
const FUEL_META = {
  petrol: { label: "Petrol", icon: FireIcon, text: "text-gray-700 dark:text-gray-200" },
  diesel: { label: "Diesel", icon: FireIcon, text: "text-gray-700 dark:text-gray-200" },
  electric: { label: "Electric", icon: BoltIcon, text: "text-emerald-600 dark:text-emerald-400" },
  hybrid: { label: "Hybrid", icon: BoltIcon, text: "text-gray-700 dark:text-gray-200" },
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
        isInWishlist(vehicle._id) ? "Removed from wishlist" : "Added to wishlist",
      );
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const inWishlist = isInWishlist(vehicle._id);
  const isPeakPrice = vehicle.currentPrice > vehicle.basePrice;

  const fuelType = vehicle.fuelType || "petrol";
  const fuel = FUEL_META[fuelType] || FUEL_META.petrol;
  const FuelIcon = fuel.icon;
  const vehicleName = vehicle.name || "Vehicle";
  const vehicleYear = vehicle.year || "2024";
  const vehicleCity = vehicle.city || "Unknown";
  const totalReviews = vehicle.totalReviews || 0;
  const averageRating = vehicle.averageRating || 0;

  const displayPrice =
    vehicle.discountedPrice || vehicle.currentPrice || vehicle.basePrice || 0;
  const originalPrice = vehicle.originalPrice || vehicle.basePrice || 0;
  const hasDiscount = vehicle.isDiscounted && vehicle.discountedPrice;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    hover: {
      y: -8,
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
        {/* Card Container */}
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300">
          {/* Image */}
          <div
            className="relative overflow-hidden bg-gray-100 dark:bg-gray-800"
            style={{ paddingBottom: compact ? "60%" : "68%" }}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
            )}

            <img
              src={
                vehicle.images?.[0] ||
                "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600"
              }
              alt={vehicleName}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
                isHovered ? "scale-105" : "scale-100"
              } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />

            {/* Subtle bottom gradient for badge legibility */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

            {/* Fuel Badge */}
            <div className="absolute top-3 left-3 z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/40 dark:border-gray-700 shadow-sm">
                <FuelIcon className={`w-3.5 h-3.5 ${fuel.text}`} />
                <span className={`text-xs font-medium ${fuel.text}`}>
                  {fuel.label}
                </span>
              </div>
            </div>

            {/* Availability Badge */}
            <div className="absolute top-3 right-3 z-10">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm border shadow-sm ${
                  vehicle.isAvailable
                    ? "bg-emerald-500/90 border-emerald-400/50"
                    : "bg-gray-800/80 border-gray-600/50"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    vehicle.isAvailable ? "bg-white" : "bg-gray-300"
                  }`}
                />
                <span className="text-xs font-semibold text-white tracking-wide">
                  {vehicle.isAvailable ? "Available" : "Booked"}
                </span>
              </div>
            </div>

            {/* Peak Season Badge */}
            {isPeakPrice && (
              <div className="absolute bottom-3 left-3 z-10">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/90 backdrop-blur-sm shadow-sm">
                  <FireIcon className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-semibold text-white">
                    Peak Season
                  </span>
                </div>
              </div>
            )}

            {/* Wishlist Button */}
            <motion.button
              onClick={handleWishlist}
              whileTap={{ scale: 0.9 }}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute bottom-3 right-3 z-10 w-9 h-9 rounded-full backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/40 dark:border-gray-700 flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-110"
            >
              {inWishlist ? (
                <HeartSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Title & Year */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">
                {vehicleName}
              </h3>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                <CalendarIcon className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {vehicleYear}
                </span>
              </div>
            </div>

            {/* Location & Rating */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPinIcon className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate">{vehicleCity}</span>
              </div>

              {totalReviews > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                  <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">({totalReviews})</span>
                </div>
              )}
            </div>

            {/* Features */}
            {!compact && vehicle.specifications?.features?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {vehicle.specifications.features.slice(0, 3).map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full"
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

            {/* Price & Action */}
            <div className="flex items-end justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <div>
                {hasDiscount ? (
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        ₹{displayPrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ₹{originalPrice.toLocaleString()}
                      </span>
                      <span className="px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-md">
                        -{vehicle.discountPercentage}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">per day</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      ₹{displayPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">/day</span>
                  </div>
                )}
              </div>

              {vehicle.isAvailable && (
                <span className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-amber-500 text-white font-semibold text-xs shadow-sm group-hover:bg-amber-600 transition-colors duration-200">
                  Book Now
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {/* Trust note */}
            <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400 dark:text-gray-500">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              Free cancellation • Insurance included
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
