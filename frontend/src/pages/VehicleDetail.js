import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  vehicleAPI,
  reviewAPI,
  wishlistAPI,
  bookingAPI,
  kycAPI, // ✅ Add KYC API
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { StarRating } from "../components/common/LoadingSpinner";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ReviewModal from "../components/ReviewModal";
import {
  MapPinIcon,
  HeartIcon,
  ShareIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  PhoneIcon,
  StarIcon as StarOutline,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolid,
  StarIcon as StarSolid,
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isInWishlist, toggleWishlist, user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  useEffect(() => {
    loadVehicleData();
  }, [id]);

  const loadVehicleData = async () => {
    setLoading(true);
    try {
      const [vRes, rRes] = await Promise.all([
        vehicleAPI.getOne(id),
        reviewAPI.getByVehicle(id),
      ]);
      setVehicle(vRes.data.vehicle);
      setReviews(rRes.data.reviews || []);

      // Check if user can review after loading data
      if (isAuthenticated && vRes.data.vehicle) {
        await checkCanReview(vRes.data.vehicle);
      }
    } catch (error) {
      console.error("Error loading vehicle:", error);
      navigate("/vehicles");
    } finally {
      setLoading(false);
    }
  };

  // Check if user can review this vehicle
  const checkCanReview = async (vehicleData) => {
    if (!isAuthenticated || !vehicleData) return;

    try {
      // Get user's bookings
      const bookingsRes = await bookingAPI.getAll();
      const userBookings = bookingsRes.data.bookings || [];

      // Check if user has a completed/paid booking for this vehicle
      const hasPaidBooking = userBookings.some(
        (booking) =>
          booking.vehicle?._id === id &&
          booking.paymentStatus === "paid" &&
          booking.status === "confirmed",
      );

      setCanReview(hasPaidBooking);

      // Check if user already reviewed
      const userReview = reviews.find((r) => r.user?._id === user?._id);
      setHasReviewed(!!userReview);
    } catch (error) {
      console.error("Error checking review eligibility:", error);
    }
  };

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

  // ✅ Refresh reviews function
  const refreshReviews = async () => {
    console.log("Refreshing reviews...");
    try {
      const rRes = await reviewAPI.getByVehicle(id);
      console.log("Fetched reviews:", rRes.data.reviews);
      setReviews(rRes.data.reviews || []);

      // Also refresh vehicle to update rating
      const vRes = await vehicleAPI.getOne(id);
      setVehicle(vRes.data.vehicle);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const callVendor = () => {
    if (!vehicle) return;
    const vendorPhone =
      vehicle.vendorDetails?.phone || vehicle.vendor?.phone || "9876543210";
    window.location.href = `tel:${vendorPhone}`;
  };

  const shareOnWhatsApp = () => {
    if (!vehicle) return;
    const message = `🚗 *${vehicle.name}* by ${vehicle.brand}\n\n💰 Price: ₹${vehicle.currentPrice || vehicle.basePrice}/day\n📍 Location: ${vehicle.city}\n⭐ Rating: ${vehicle.averageRating || 0}★\n\n🔗 Book now: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  // ✅ Handle review success
  const handleReviewSuccess = async () => {
    console.log("Review submitted, refreshing...");
    await refreshReviews();
    toast.success("Thank you for your review! 🌟");
  };

  // ✅ NEW: Handle book now with KYC check
  // const handleBookNow = async () => {
  //   if (!isAuthenticated) {
  //     navigate("/login");
  //     return;
  //   }

  //   setIsBookingLoading(true);

  //   try {
  //     // Check KYC status first
  //     const kycRes = await kycAPI.getStatus();
  //     const kycStatus = kycRes.data.kycStatus;

  //     if (kycStatus === "verified") {
  //       // KYC verified, proceed to booking
  //       navigate(`/book/${id}`);
  //     } else if (kycStatus === "pending") {
  //       toast.error("Your KYC is under review. Please wait for verification.", {
  //         duration: 5000,
  //       });
  //       navigate("/kyc");
  //     } else if (kycStatus === "rejected") {
  //       toast.error("Your KYC was rejected. Please re-upload documents.", {
  //         duration: 5000,
  //       });
  //       navigate("/kyc");
  //     } else {
  //       // not_submitted
  //       toast.error("Please complete KYC verification before booking", {
  //         duration: 4000,
  //       });
  //       navigate("/kyc");
  //     }
  //   } catch (error) {
  //     console.error("KYC check error:", error);
  //     toast.error("Please complete KYC verification before booking");
  //     navigate("/kyc");
  //   } finally {
  //     setIsBookingLoading(false);
  //   }
  // };
  const handleBookNow = () => {
    console.log("📖 Book Now clicked, isAuthenticated:", isAuthenticated);

    if (!isAuthenticated) {
      console.log("🔒 Not authenticated, redirecting to login");
      toast.error("Please login to book a vehicle");
      navigate("/login");
      return;
    }

    console.log("✅ Authenticated, proceeding to booking");
    navigate(`/book/${id}`);
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

              <div className="relative group">
                <button className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center hover:border-amber-300 transition-colors">
                  <ShareIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={shareOnWhatsApp}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-t-xl transition"
                  >
                    Share on WhatsApp
                  </button>
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-xl transition"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>

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
              <>
                <button
                  onClick={handleBookNow}
                  disabled={isBookingLoading}
                  className="w-full btn-primary flex items-center justify-center gap-2 mb-3"
                >
                  {isBookingLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <CalendarDaysIcon className="w-5 h-5" />
                      Book Now
                    </>
                  )}
                </button>

                {/* KYC Warning - Show if user is authenticated but KYC not done */}
                {isAuthenticated && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 text-center mb-2">
                    ⚠️ KYC verification required before booking
                  </p>
                )}

                {/* Review Button - Only for paid users who haven't reviewed */}
                {canReview && !hasReviewed && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all duration-200 font-medium mb-2"
                  >
                    <StarOutline className="w-5 h-5" />
                    Write a Review
                  </button>
                )}

                {/* Already Reviewed Message */}
                {hasReviewed && (
                  <div className="w-full text-center py-2 text-green-600 dark:text-green-400 text-sm flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Thank you for your review! 🌟
                  </div>
                )}

                <button
                  onClick={callVendor}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 font-medium"
                >
                  <PhoneIcon className="w-5 h-5" />
                  Call Vendor for Details
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  📞 Call vendor to confirm availability or ask questions
                </p>
              </>
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
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) =>
                        star <= r.rating ? (
                          <StarSolid
                            key={star}
                            className="w-3 h-3 text-amber-500"
                          />
                        ) : (
                          <StarOutline
                            key={star}
                            className="w-3 h-3 text-gray-300"
                          />
                        ),
                      )}
                    </div>
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

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        vehicle={vehicle}
        onReviewSubmitted={refreshReviews}
      />
    </div>
  );
}
