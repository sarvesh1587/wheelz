import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { vehicleAPI, aiAPI } from "../services/api";
import VehicleCard from "../components/vehicle/VehicleCard";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CITIES = [
  "All Cities",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Jaipur",
  "Kolkata",
  "Kota",
];
const FUEL_TYPES = ["All", "petrol", "diesel", "electric", "hybrid"];
const SORT_OPTIONS = [
  { value: "", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function Vehicles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [nlQuery, setNlQuery] = useState("");
  const [aiSearching, setAiSearching] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    city: searchParams.get("city") || "",
    fuelType: searchParams.get("fuelType") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "",
    page: parseInt(searchParams.get("page") || "1"),
    search: searchParams.get("search") || "",
  });

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      params.limit = 12;
      const res = await vehicleAPI.getAll(params);
      setVehicles(res.data.vehicles);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value, page: 1 };
    setFilters(next);
    const params = {};
    Object.entries(next).forEach(([k, v]) => {
      if (v && v !== "1") params[k] = v;
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const reset = {
      category: "",
      city: "",
      fuelType: "",
      minPrice: "",
      maxPrice: "",
      sort: "",
      page: 1,
      search: "",
    };
    setFilters(reset);
    setSearchParams({});
  };

  const handleAISearch = async (e) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setAiSearching(true);
    try {
      const res = await aiAPI.smartSearch(nlQuery);
      const p = res.data.extractedParams;
      const next = {
        ...filters,
        category: p.category || "",
        city: p.city || "",
        fuelType: p.fuelType || "",
        maxPrice: p.maxPrice || "",
        search: nlQuery,
        page: 1,
      };
      setFilters(next);
    } catch {
    } finally {
      setAiSearching(false);
    }
  };

  const activeFilterCount = [
    filters.category,
    filters.city,
    filters.fuelType,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {filters.category === "car"
            ? "🚗 Cars"
            : filters.category === "bike"
              ? "🏍️ Bikes"
              : "All Vehicles"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {loading
            ? "Searching..."
            : `${total} vehicle${total !== 1 ? "s" : ""} found`}
        </p>
      </div>

      <form onSubmit={handleAISearch} className="flex gap-2 mb-6">
        <div className="flex-1 flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4">
          <SparklesIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <input
            type="text"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            placeholder='AI Search: "electric car under 2000 in Mumbai"'
            className="flex-1 py-3 bg-transparent outline-none text-gray-900 dark:text-white text-sm placeholder-gray-400"
          />
          {nlQuery && (
            <button type="button" onClick={() => setNlQuery("")}>
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={aiSearching}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-xl transition-colors disabled:opacity-70 text-sm"
        >
          {aiSearching ? "..." : "Search"}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {["", "car", "bike"].map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilter("category", cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.category === cat
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {cat === "" ? "All" : cat === "car" ? "🚗 Cars" : "🏍️ Bikes"}
            </button>
          ))}
        </div>

        <select
          value={filters.city}
          onChange={(e) => updateFilter("city", e.target.value)}
          className="px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300"
        >
          {CITIES.map((c) => (
            <option key={c} value={c === "All Cities" ? "" : c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filters.fuelType}
          onChange={(e) => updateFilter("fuelType", e.target.value)}
          className="px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300"
        >
          {FUEL_TYPES.map((f) => (
            <option key={f} value={f === "All" ? "" : f}>
              {f === "All"
                ? "All Fuels"
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className="w-24 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className="w-24 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300"
          />
        </div>

        <select
          value={filters.sort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300 ml-auto"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
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
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🔍</p>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No vehicles found
          </h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or search differently
          </p>
          <button onClick={clearFilters} className="btn-primary">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((v) => (
            <VehicleCard key={v._id} vehicle={v} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => updateFilter("page", i + 1)}
              className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                filters.page === i + 1
                  ? "bg-amber-500 text-gray-900"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-amber-400"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
