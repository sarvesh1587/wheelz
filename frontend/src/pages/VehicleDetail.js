import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { vehicleAPI, reviewAPI, wishlistAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { StarRating } from "../components/common/LoadingSpinner";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  MapPinIcon,
  HeartIcon,
  ShareIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isInWishlist, toggleWishlist } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    Promise.all([vehicleAPI.getOne(id), reviewAPI.getByVehicle(id)])
      .then(([vRes, rRes]) => {
        setVehicle(vRes.data.vehicle);
        setReviews(rRes.data.reviews);
      })
      .catch(() => navigate("/vehicles"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      return;
    }
    await wishlistAPI.toggle(id);
    toggleWishlist(id);
    toast.success(
      isInWishlist(id) ? "Removed from wishlist" : "Added to wishlist ❤️",
    );
  };

  // ✅ Share on WhatsApp Function
  const shareOnWhatsApp = () => {
    const vehicleName = vehicle?.name || "Vehicle";
    const price = vehicle?.currentPrice || vehicle?.basePrice || 0;
    const brand = vehicle?.brand || "";
    const city = vehicle?.city || "";

    const message =
      `🚗 *${vehicleName}* by ${brand}\n\n` +
      `💰 Price: ₹${price}/day\n` +
      `📍 Location: ${city}\n` +
      `⭐ Rating: ${vehicle?.averageRating || 0}★ (${vehicle?.totalReviews || 0} reviews)\n\n` +
      `🔗 Book now: ${window.location.href}\n\n` +
      `🚀 Rent with Wheelz - Premium Vehicle Rentals`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // ✅ Share via Copy Link
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) return <LoadingSpinner />;
  if (!vehicle) return null;

  const inWishlist = isInWishlist(id);
  const isPeak = vehicle.currentPrice > vehicle.basePrice;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Images */}
        <div>
          <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3 aspect-[4/3]">
            <img
              src={vehicle.images?.[activeImg] || vehicle.images?.[0]}
              alt={vehicle.name}
              className="w-full h-full object-cover"
            />
          </div>
          {vehicle.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {vehicle.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeImg === i ? "border-amber-500" : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <span className="text-xs font-medium text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg capitalize">
                {vehicle.category} · {vehicle.subCategory}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {vehicle.name}
              </h1>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleWishlist}
                className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center hover:border-red-300 transition-colors"
              >
                {inWishlist ? (
                  <HeartSolid className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              {/* ✅ Share Button with Dropdown */}
              <div className="relative group">
                <button className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center hover:border-amber-300 transition-colors">
                  <ShareIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={shareOnWhatsApp}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-t-xl transition"
                  >
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.614-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.01-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    Share on WhatsApp
                  </button>
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-xl transition"
                  >
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Rating + Location */}
          <div className="flex items-center flex-wrap gap-4 mb-4">
            <StarRating
              rating={vehicle.averageRating}
              count={vehicle.totalReviews}
              size="lg"
            />
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPinIcon className="w-4 h-4" />
              {vehicle.locationName}, {vehicle.city}
            </div>
          </div>

          {/* Rest of your existing code... (Specs, Features, Price, etc.) */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              ["Year", vehicle.year],
              [
                "Fuel",
                vehicle.fuelType.charAt(0).toUpperCase() +
                  vehicle.fuelType.slice(1),
              ],
              ["Transmission", vehicle.transmission],
              ["Seating", `${vehicle.seatingCapacity} seats`],
              ["Mileage", vehicle.specifications?.mileage || "—"],
              ["Engine", vehicle.specifications?.engine || "—"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3"
              >
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {vehicle.specifications?.features?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {vehicle.specifications.features.map((f) => (
                  <span
                    key={f}
                    className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl"
                  >
                    <CheckCircleIcon className="w-3 h-3 text-green-500" /> {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5">
            <div className="flex items-end gap-3 mb-4">
              <div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹
                  {(vehicle.currentPrice || vehicle.basePrice).toLocaleString()}
                </span>
                <span className="text-gray-500 text-sm">/day</span>
              </div>
              {isPeak && (
                <div className="text-sm">
                  <span className="line-through text-gray-400">
                    ₹{vehicle.basePrice.toLocaleString()}
                  </span>
                  <span className="ml-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-lg">
                    🔥 Peak Pricing
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-2.5 h-2.5 rounded-full ${vehicle.isAvailable ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {vehicle.isAvailable
                  ? "Available Now"
                  : "Currently Unavailable"}
              </span>
            </div>

            {vehicle.isAvailable ? (
              <button
                onClick={() =>
                  isAuthenticated ? navigate(`/book/${id}`) : navigate("/login")
                }
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <CalendarDaysIcon className="w-5 h-5" />
                {isAuthenticated ? "Book Now" : "Login to Book"}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
              >
                Not Available
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-14">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            <p className="text-4xl mb-3">⭐</p>
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center font-bold text-amber-600 dark:text-amber-400 text-sm">
                    {r.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {r.user?.name}
                    </p>
                    <StarRating rating={r.rating} />
                  </div>
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                {r.title && (
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">
                    {r.title}
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {r.comment}
                </p>
                {r.isVerified && (
                  <div className="flex items-center gap-1 mt-3 text-xs text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="w-3.5 h-3.5" /> Verified Rental
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
