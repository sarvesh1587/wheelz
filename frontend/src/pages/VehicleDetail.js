import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  vehicleAPI,
  reviewAPI,
  wishlistAPI,
  bookingAPI,
  kycAPI,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ReviewModal from "../components/ReviewModal";
import {
  MapPin,
  Heart,
  Share2,
  Check,
  Phone,
  Star,
  ArrowUpRight,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Reveal, SplitText, Magnetic, EASE } from "../components/motion";

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
      isInWishlist(id) ? "Removed from wishlist" : "Saved to wishlist",
    );
  };

  // Refresh reviews and the vehicle rating after a new review
  const refreshReviews = async () => {
    try {
      const rRes = await reviewAPI.getByVehicle(id);
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
    const message = `*${vehicle.name}* by ${vehicle.brand}\n\nPrice: ₹${vehicle.currentPrice || vehicle.basePrice}/day\nLocation: ${vehicle.city}\nRating: ${vehicle.averageRating || 0}/5\n\nBook now: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  // Handle review success
  const handleReviewSuccess = async () => {
    await refreshReviews();
    toast.success("Thanks for your review");
  };

  const handleBookNow = async () => {

    if (!isAuthenticated) {
      toast.error("Please login to book a vehicle");
      navigate("/login");
      return;
    }

    setIsBookingLoading(true);

    try {
      // First, verify token is still valid
      const token = localStorage.getItem("wheelz_token");
      if (!token) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      // Check KYC status
      const kycRes = await kycAPI.getStatus();
      const kycStatus = kycRes.data.kycStatus;

      if (kycStatus === "verified") {
        navigate(`/book/${id}`);
      } else if (kycStatus === "pending") {
        toast.error("Your KYC is under review. Please wait for verification.", {
          duration: 4000,
        });
        navigate("/kyc");
      } else if (kycStatus === "rejected") {
        toast.error("Your KYC was rejected. Please re-upload documents.", {
          duration: 4000,
        });
        navigate("/kyc");
      } else {
        toast.error(
          "KYC verification required. Please complete KYC before booking.",
          {
            duration: 4000,
          },
        );
        navigate("/kyc");
      }
    } catch (error) {
      console.error("KYC check error:", error);

      // If 401 or 403, token might be invalid
      if (error.response?.status === 401) {
        localStorage.removeItem("wheelz_token");
        localStorage.removeItem("wheelz_user");
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Please complete KYC verification before booking");
        navigate("/kyc");
      }
    } finally {
      setIsBookingLoading(false);
    }
  };
  if (loading) return <LoadingSpinner />;
  if (!vehicle) return null;

  const inWishlist = isInWishlist(id);
  const isPeak = vehicle.currentPrice > vehicle.basePrice;
  const price = vehicle.currentPrice || vehicle.basePrice;
  const images = vehicle.images?.length ? vehicle.images : [];
  const specs = [
    ["Year", vehicle.year],
    ["Fuel", vehicle.fuelType],
    ["Transmission", vehicle.transmission],
    ["Seating", vehicle.seatingCapacity ? `${vehicle.seatingCapacity} seats` : "—"],
    ["Mileage", vehicle.specifications?.mileage || "—"],
    ["Engine", vehicle.specifications?.engine || "—"],
  ];

  return (
    <div className="container-x pb-24 pt-24 md:pt-28">
      <Link
        to="/vehicles"
        className="link-underline mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to fleet
      </Link>

      <motion.div
        initial={{ clipPath: "inset(10% 6% 10% 6% round 28px)", opacity: 0 }}
        animate={{ clipPath: "inset(0% 0% 0% 0% round 28px)", opacity: 1 }}
        transition={{ duration: 1.3, ease: EASE }}
        className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-raised md:aspect-[21/9]"
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={activeImg}
            src={images[activeImg] || images[0]}
            alt={vehicle.name}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: EASE }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 flex gap-2 md:bottom-6 md:left-6">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                aria-label={`Show photo ${i + 1}`}
                className={`h-14 w-20 overflow-hidden rounded-xl border-2 transition-all duration-300 md:h-16 md:w-24 ${
                  activeImg === i ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <span className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 font-mono text-[11px] text-white backdrop-blur-md md:right-6 md:top-6">
          {String(activeImg + 1).padStart(2, "0")} / {String(Math.max(images.length, 1)).padStart(2, "0")}
        </span>
      </motion.div>

      <div className="mt-12 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-5">
            {vehicle.category} · {vehicle.subCategory}
          </p>
          <h1 className="display text-5xl md:text-7xl">
            <SplitText lines={[vehicle.name]} delay={0.3} />
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
            {vehicle.totalReviews > 0 && (
              <span className="flex items-center gap-1.5 text-ink">
                <Star size={14} className="fill-accent text-accent" />
                {Number(vehicle.averageRating || 0).toFixed(1)}
                <span className="text-muted">({vehicle.totalReviews} reviews)</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {[vehicle.locationName, vehicle.city].filter(Boolean).join(", ")}
            </span>
          </div>

          <Reveal className="mt-14">
            <p className="eyebrow mb-4">Specifications</p>
            <dl className="grid grid-cols-2 border-t border-line/10 sm:grid-cols-3">
              {specs.map(([label, value]) => (
                <div key={label} className="border-b border-line/10 py-5 pr-4">
                  <dt className="eyebrow">{label}</dt>
                  <dd className="display-tight mt-2 text-xl capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {vehicle.specifications?.features?.length > 0 && (
            <Reveal className="mt-14">
              <p className="eyebrow mb-4">What's included</p>
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {vehicle.specifications.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 border-b border-line/10 py-3 text-sm">
                    <Check size={14} className="text-accent" /> {f}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-28 rounded-[24px] border border-line/10 bg-surface p-6 md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow mb-2">Per day</p>
                <p className="display text-6xl">₹{price.toLocaleString("en-IN")}</p>
                {isPeak && (
                  <p className="mt-2 text-sm text-muted">
                    <span className="line-through">₹{vehicle.basePrice.toLocaleString("en-IN")}</span>
                    <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[11px] text-accent">
                      Peak pricing
                    </span>
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleWishlist}
                  aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
                  aria-pressed={inWishlist}
                  className="grid h-11 w-11 place-items-center rounded-full border border-line/15 transition-colors hover:border-ink"
                >
                  <Heart size={16} className={inWishlist ? "fill-accent text-accent" : ""} />
                </button>
                <div className="group relative">
                  <button
                    aria-label="Share"
                    className="grid h-11 w-11 place-items-center rounded-full border border-line/15 transition-colors hover:border-ink"
                  >
                    <Share2 size={16} />
                  </button>
                  <div className="invisible absolute right-0 z-10 mt-2 w-48 rounded-2xl border border-line/10 bg-surface p-1.5 opacity-0 shadow-2xl transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <button onClick={shareOnWhatsApp} className="w-full rounded-xl px-3 py-2.5 text-left text-sm hover:bg-raised">
                      Share on WhatsApp
                    </button>
                    <button onClick={copyLink} className="w-full rounded-xl px-3 py-2.5 text-left text-sm hover:bg-raised">
                      Copy link
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="my-6 flex items-center gap-2 border-y border-line/10 py-4 text-sm">
              <span className={`h-2 w-2 rounded-full ${vehicle.isAvailable ? "bg-emerald-400" : "bg-line/30"}`} />
              {vehicle.isAvailable ? "Available now" : "Currently unavailable"}
            </div>

            {vehicle.isAvailable ? (
              <div className="space-y-3">
                <Magnetic strength={0.15} className="w-full">
                  <button
                    onClick={handleBookNow}
                    disabled={isBookingLoading}
                    className="btn-primary w-full !py-4 text-base"
                  >
                    {isBookingLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Checking KYC…
                      </>
                    ) : (
                      <>
                        Book this ride <ArrowUpRight size={18} />
                      </>
                    )}
                  </button>
                </Magnetic>
                <button onClick={callVendor} className="btn-ghost w-full">
                  <Phone size={16} /> Call the owner
                </button>
                {canReview && !hasReviewed && (
                  <button onClick={() => setShowReviewModal(true)} className="btn-ghost w-full">
                    <Star size={16} /> Write a review
                  </button>
                )}
                {hasReviewed && (
                  <p className="flex items-center justify-center gap-2 text-sm text-muted">
                    <Check size={14} className="text-accent" /> Thanks for reviewing this ride
                  </p>
                )}
                {isAuthenticated && (
                  <p className="pt-2 text-center text-xs text-muted">
                    A verified KYC is needed before your first booking.
                  </p>
                )}
              </div>
            ) : (
              <button disabled className="btn w-full cursor-not-allowed border border-line/10 text-muted">
                Not available
              </button>
            )}
          </div>
        </aside>
      </div>

      <section className="mt-24 border-t border-line/10 pt-14">
        <div className="mb-10 flex items-baseline justify-between">
          <h2 className="display-tight text-4xl md:text-5xl">Reviews</h2>
          <span className="font-mono text-sm text-muted">{String(reviews.length).padStart(2, "0")}</span>
        </div>
        {reviews.length === 0 ? (
          <p className="text-muted">No reviews yet. Book it and be the first to share how it went.</p>
        ) : (
          <div className="grid gap-x-10 md:grid-cols-2">
            {reviews.map((r, i) => (
              <Reveal key={r._id} delay={(i % 2) * 0.06} className="border-b border-line/10 py-8">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={s <= r.rating ? "fill-accent text-accent" : "text-line/20"}
                      />
                    ))}
                  </span>
                  <span className="eyebrow">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                {r.title && <p className="display-tight mb-2 text-xl">{r.title}</p>}
                <p className="leading-relaxed text-muted">{r.comment}</p>
                <p className="mt-4 text-sm font-medium">
                  {r.user?.name}
                  {r.isVerified && <span className="ml-2 text-xs font-normal text-accent">Verified rental</span>}
                </p>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        vehicle={vehicle}
        onReviewSubmitted={refreshReviews}
      />
    </div>
  );
}
