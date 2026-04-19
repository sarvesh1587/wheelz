import React, { useState, useEffect } from "react";
import {
  StarIcon,
  UserCircleIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { reviewAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const ReviewSection = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [showAllReviews, setShowAllReviews] = useState(false);
  const reviewsToShow = showAllReviews ? reviews : reviews.slice(0, 3);

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      const vehiclesRes = await fetch(
        `${process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api"}/vehicles?limit=50`,
      );
      const vehiclesData = await vehiclesRes.json();

      let allReviews = [];
      for (const vehicle of vehiclesData.vehicles || []) {
        try {
          const reviewsRes = await reviewAPI.getByVehicle(vehicle._id);
          if (reviewsRes.data.reviews && reviewsRes.data.reviews.length > 0) {
            allReviews = [...allReviews, ...reviewsRes.data.reviews];
          }
        } catch (err) {
          console.error(
            `Error fetching reviews for vehicle ${vehicle._id}:`,
            err,
          );
        }
      }

      allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReviews(allReviews);

      const total = allReviews.length;
      const avg =
        total > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / total
          : 0;
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      allReviews.forEach((r) => {
        if (distribution[r.rating]) distribution[r.rating]++;
      });

      setStats({
        averageRating: avg,
        totalReviews: total,
        ratingDistribution: distribution,
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (email) => {
    const colors = [
      "bg-gradient-to-br from-red-500 to-red-600",
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-green-500 to-green-600",
      "bg-gradient-to-br from-purple-500 to-purple-600",
      "bg-gradient-to-br from-pink-500 to-pink-600",
      "bg-gradient-to-br from-indigo-500 to-indigo-600",
      "bg-gradient-to-br from-orange-500 to-orange-600",
      "bg-gradient-to-br from-teal-500 to-teal-600",
    ];
    const index = (email?.length || 0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const goToAllReviews = () => {
    navigate("/vehicles");
    setTimeout(() => {
      const reviewsSection = document.getElementById("reviews-section");
      if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-500">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div
      className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900"
      id="reviews-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <StarIcon className="w-4 h-4" />
            Customer Reviews
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            What Our <span className="text-amber-500">Customers Say</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real experiences from real people who trusted Wheelz for their
            journeys
          </p>
        </div>

        {/* Stats Section with Filled Bar Charts */}
        {stats.totalReviews > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left - Rating Summary */}
              <div className="text-center lg:text-left">
                <div className="flex flex-col items-center lg:flex-row lg:items-center gap-6">
                  <div>
                    <div className="text-6xl font-bold text-amber-500">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) =>
                        star <= Math.round(stats.averageRating) ? (
                          <StarIcon
                            key={star}
                            className="w-5 h-5 text-amber-400"
                          />
                        ) : (
                          <StarOutline
                            key={star}
                            className="w-5 h-5 text-gray-300"
                          />
                        ),
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Based on {stats.totalReviews} reviews
                    </p>
                  </div>

                  {/* Rating Distribution Bars */}
                  <div className="flex-1 w-full">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const percentage =
                        stats.totalReviews > 0
                          ? (stats.ratingDistribution[star] /
                              stats.totalReviews) *
                            100
                          : 0;
                      return (
                        <div
                          key={star}
                          className="flex items-center gap-2 mb-2"
                        >
                          <span className="text-sm font-medium w-12 flex items-center gap-1">
                            {star}{" "}
                            <StarIcon className="w-3 h-3 text-amber-400" />
                          </span>
                          <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-10">
                            {stats.ratingDistribution[star]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right - Trust Badges */}
              <div className="border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 pt-6 lg:pt-0 lg:pl-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      500+
                    </div>
                    <div className="text-sm text-gray-500">Happy Customers</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      15+
                    </div>
                    <div className="text-sm text-gray-500">Cities Served</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      98%
                    </div>
                    <div className="text-sm text-gray-500">
                      Satisfaction Rate
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      24/7
                    </div>
                    <div className="text-sm text-gray-500">
                      Customer Support
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Grid - Only 3 reviews on homepage */}
        {reviews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviewsToShow.map((review, index) => (
                <div
                  key={review._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6 pb-4">
                    {/* User Info */}
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-full ${getRandomColor(review.user?.email)} flex items-center justify-center text-white font-bold text-lg shadow-md`}
                      >
                        {getInitials(review.user?.name)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {review.user?.name || "Anonymous User"}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) =>
                              star <= review.rating ? (
                                <StarIcon
                                  key={star}
                                  className="w-3.5 h-3.5 text-amber-400"
                                />
                              ) : (
                                <StarOutline
                                  key={star}
                                  className="w-3.5 h-3.5 text-gray-300"
                                />
                              ),
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            ({review.rating})
                          </span>
                        </div>
                      </div>
                      {review.isVerified && (
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full">
                          ✓ Verified
                        </div>
                      )}
                    </div>

                    {/* Review Content */}
                    {review.title && (
                      <h5 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {review.title}
                      </h5>
                    )}
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                      {review.comment ||
                        "Great experience with Wheelz! The vehicle was clean and well-maintained."}
                    </p>

                    {/* Footer with Email and Date */}
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <UserCircleIcon className="w-3.5 h-3.5" />
                        <span>
                          {review.user?.email?.replace(
                            /(.{3})(.*)(?=@)/,
                            "$1***",
                          ) || "user@example.com"}
                        </span>
                        <span className="mx-1">•</span>
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* More Reviews Button */}
            {reviews.length > 3 && !showAllReviews && (
              <div className="text-center mt-10">
                <button
                  onClick={goToAllReviews}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-amber-500/25"
                >
                  See All {reviews.length} Reviews
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* View Less Button (if showing all on same page) */}
            {showAllReviews && reviews.length > 3 && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setShowAllReviews(false)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  Show Less
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Reviews Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to share your experience!
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Complete a booking and leave a review
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
