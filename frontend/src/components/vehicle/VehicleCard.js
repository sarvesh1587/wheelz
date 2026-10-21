import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowUpRight, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { wishlistAPI } from "../../services/api";
import toast from "react-hot-toast";
import { EASE } from "../motion";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&q=80";

export default function VehicleCard({ vehicle, compact = false, index = 0 }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isAuthenticated, isInWishlist, toggleWishlist } = useAuth();

  if (!vehicle) return null;

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Log in to save vehicles");
      return;
    }
    try {
      await wishlistAPI.toggle(vehicle._id);
      toggleWishlist(vehicle._id);
      toast.success(
        isInWishlist(vehicle._id) ? "Removed from wishlist" : "Saved to wishlist",
      );
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const inWishlist = isInWishlist(vehicle._id);
  const isPeakPrice = vehicle.currentPrice > vehicle.basePrice;
  const fuelType = vehicle.fuelType || "petrol";
  const name = vehicle.name || "Vehicle";
  const year = vehicle.year || "2024";
  const city = vehicle.city || "India";
  const totalReviews = vehicle.totalReviews || 0;
  const averageRating = vehicle.averageRating || 0;

  const displayPrice =
    vehicle.discountedPrice || vehicle.currentPrice || vehicle.basePrice || 0;
  const originalPrice = vehicle.originalPrice || vehicle.basePrice || 0;
  const hasDiscount = vehicle.isDiscounted && vehicle.discountedPrice;

  return (
    <motion.article
      transition={{ duration: 0.9, ease: EASE, delay: (index % 4) * 0.07 }}
    >
      <Link to={`/vehicles/${vehicle._id}`} className="group block">
        <div
          className={`relative overflow-hidden rounded-[20px] bg-raised ${
            compact ? "aspect-[4/3]" : "aspect-[4/5]"
          }`}
        >
          {!imageLoaded && <div className="shimmer absolute inset-0" />}
          <img
            src={vehicle.images?.[0] || FALLBACK_IMAGE}
            alt={name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-[1.2s] ease-out-expo group-hover:scale-[1.06] ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/0" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur-md">
                {fuelType}
              </span>
              {isPeakPrice && (
                <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-ink">
                  Peak
                </span>
              )}
            </div>
            <button
              onClick={handleWishlist}
              aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={inWishlist}
              className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md transition-transform duration-300 hover:scale-110 active:scale-95"
            >
              <Heart
                size={16}
                strokeWidth={1.75}
                className={inWishlist ? "fill-accent text-accent" : ""}
              />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                vehicle.isAvailable ? "bg-emerald-400" : "bg-white/40"
              }`}
            />
            {vehicle.isAvailable ? "Available" : "Booked"}
          </div>

          <span className="absolute bottom-4 right-4 grid h-11 w-11 translate-y-3 place-items-center rounded-full bg-white text-black opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={18} />
          </span>
        </div>

        <div className="pt-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="display-tight text-lg leading-tight md:text-xl">{name}</h3>
            {totalReviews > 0 && (
              <span className="flex shrink-0 items-center gap-1 pt-1 text-sm">
                <Star size={13} className="fill-ink text-ink" />
                {averageRating.toFixed(1)}
                <span className="text-muted">({totalReviews})</span>
              </span>
            )}
          </div>
          <p className="eyebrow mt-1.5">
            {city} · {year}
          </p>

          <div className="mt-4 flex items-baseline gap-2 border-t border-line/10 pt-3">
            <span className="display-tight text-2xl">
              ₹{displayPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-sm text-muted">/ day</span>
            {hasDiscount && (
              <>
                <span className="ml-auto text-sm text-muted line-through">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[11px] text-accent">
                  −{vehicle.discountPercentage}%
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
