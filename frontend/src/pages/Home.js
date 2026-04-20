import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ ADD THIS
import { vehicleAPI, aiAPI } from "../services/api";
import VehicleCard from "../components/vehicle/VehicleCard";
import AdminVehicleCard from "../components/vehicle/AdminVehicleCard"; // ✅ ADD THIS
import LoadingSpinner from "../components/common/LoadingSpinner";
import { MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";

// ... (STATS and HOW_IT_WORKS arrays same rahenge)

export default function Home() {
  const { isAdmin } = useAuth(); // ✅ ADD THIS
  const [nlQuery, setNlQuery] = useState("");
  const [featured, setFeatured] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const searchRef = useRef(null);

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

  // ... (handleSmartSearch function same rahegi)

  const filteredFeatured =
    activeTab === "all"
      ? featured
      : featured.filter((v) => v.category === activeTab);

  return (
    <div className="animate-fade-in">
      {/* Hero Section - Same */}
      <section className="hero-gradient min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
        {/* ... hero section same rahega ... */}
      </section>

      {/* Featured Vehicles Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Featured Vehicles
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isAdmin ? "Manage your fleet" : "Most popular picks this week"}
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
            {filteredFeatured.map((v) =>
              // ✅ ROLE-BASED RENDERING
              isAdmin ? (
                <AdminVehicleCard
                  key={v._id}
                  vehicle={v}
                  onVehicleUpdate={() => {
                    // Refresh featured vehicles after admin action
                    vehicleAPI
                      .getAll({ sort: "popular", limit: 8 })
                      .then((res) => setFeatured(res.data.vehicles));
                  }}
                />
              ) : (
                <VehicleCard key={v._id} vehicle={v} />
              ),
            )}
          </div>
        )}
      </section>

      {/* AI Recommendations - Same for both */}
      {recommendations.length > 0 && (
        <section className="bg-gray-100 dark:bg-gray-900/50 py-20">
          {/* ... same as before ... */}
        </section>
      )}

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        {/* ... same as before ... */}
      </section>
    </div>
  );
}
