import React, { useState, useEffect, useRef } from "react";
import ReviewSection from "../components/ReviewSection";
import { useNavigate } from "react-router-dom";
import { vehicleAPI, aiAPI } from "../services/api";
import VehicleCard from "../components/vehicle/VehicleCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { SparklesIcon } from "@heroicons/react/24/outline";
import AnimatedHero from "../components/home/AnimatedHero";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Search & Browse",
    desc: "Find cars and bikes in your city with our smart search. Filter by price, type, and features.",
  },
  {
    step: "02",
    title: "Book & Pay",
    desc: "Choose your dates, add extras like GPS or insurance, and pay securely in seconds.",
  },
  {
    step: "03",
    title: "Pick Up & Go",
    desc: "Show your booking confirmation, grab the keys, and you're off. It's that simple!",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  // ✅ Apply 20% discount to all featured vehicles
  const applyDiscount = (vehicle) => {
    const discountPercentage = 20;
    const discountedPrice = Math.round(
      vehicle.basePrice * (1 - discountPercentage / 100),
    );

    return {
      ...vehicle,
      originalPrice: vehicle.basePrice,
      discountedPrice: discountedPrice,
      discountPercentage: discountPercentage,
      discountAmount: vehicle.basePrice - discountedPrice,
      isDiscounted: true,
    };
  };

  useEffect(() => {
    vehicleAPI
      .getAll({ sort: "popular", limit: 8 })
      .then((res) => setFeatured(res.data.vehicles))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));

    aiAPI
      .getRecommendations()
      .then((res) => setRecommendations(res.data.recommendations))
      .catch(() => {});
  }, []);

  const filteredFeatured =
    activeTab === "all"
      ? featured
      : featured.filter((v) => v.category === activeTab);

  // ✅ Apply discount to all vehicles before rendering
  const discountedVehicles = filteredFeatured.map((v) => applyDiscount(v));

  return (
    <div className="animate-fade-in">
      {/* ✅ NEW Animated Hero Section - Replace old hero */}
      <AnimatedHero />

      {/* Featured Vehicles Section with Discount */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Featured Vehicles
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Most popular picks this week with up to 20% OFF
            </p>
          </div>
          <div className="flex gap-2">
            {["all", "car", "bike"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? "bg-amber-500 text-gray-900"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {tab === "all" ? "All" : tab === "car" ? "🚗 Cars" : "🏍️ Bikes"}
              </button>
            ))}
          </div>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800"
              >
                <div className="shimmer h-48" />
                <div className="p-4 space-y-2">
                  <div className="shimmer h-4 rounded w-3/4" />
                  <div className="shimmer h-3 rounded w-1/2" />
                  <div className="shimmer h-6 rounded w-1/3 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {discountedVehicles.map((v) => (
              <VehicleCard key={v._id} vehicle={v} />
            ))}
          </div>
        )}
      </section>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <section className="bg-gray-100 dark:bg-gray-900/50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <SparklesIcon className="w-6 h-6 text-amber-500" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Recommended for You
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  AI-curated picks based on your preferences
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 6).map((v) => (
                <VehicleCard key={v._id} vehicle={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            How Wheelz Works
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            From search to drive in 3 simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="text-center group">
              <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500 transition-colors duration-300">
                <span className="text-2xl font-bold text-amber-500 group-hover:text-gray-900 transition-colors">
                  {item.step}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <ReviewSection />
    </div>
  );
}
