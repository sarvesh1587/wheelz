import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { vehicleAPI, aiAPI } from "../services/api";
import VehicleCard from "../components/vehicle/VehicleCard";
import { Sparkles, X, ArrowRight } from "lucide-react";
import { SplitText, Eyebrow } from "../components/motion";
import usePlatformStats from "../hooks/usePlatformStats";

const FUEL_TYPES = ["All", "petrol", "diesel", "electric", "hybrid"];
const SORT_OPTIONS = [
  { value: "", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function Vehicles() {
  const platform = usePlatformStats();
  const CITIES = ["All Cities", ...platform.cities];
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [nlQuery, setNlQuery] = useState("");
  const [aiSearching, setAiSearching] = useState(false);

  // Initialize filters from URL params
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
        if (v && v !== "") params[k] = v;
      });
      params.limit = 12;

      const res = await vehicleAPI.getAll(params);
      setVehicles(res.data.vehicles);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Update filters when URL changes
  useEffect(() => {
    const newFilters = {
      category: searchParams.get("category") || "",
      city: searchParams.get("city") || "",
      fuelType: searchParams.get("fuelType") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "",
      page: parseInt(searchParams.get("page") || "1"),
      search: searchParams.get("search") || "",
    };
    setFilters(newFilters);
  }, [searchParams]);

  const updateFilter = (key, value) => {
    // Changing any filter returns to page 1; changing the page keeps the filters.
    const next = { ...filters, page: 1, [key]: value };
    setFilters(next);
    const params = {};
    Object.entries(next).forEach(([k, v]) => {
      if (v && v !== "") params[k] = v;
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
    } catch (err) {
      console.error("AI search error:", err);
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

  const title =
    filters.category === "car" ? "Cars" : filters.category === "bike" ? "Bikes" : "The fleet";

  const field =
    "rounded-full border border-line/15 bg-transparent px-4 py-2.5 text-sm text-ink outline-none transition-colors hover:border-ink focus:border-ink [&>option]:bg-surface";

  return (
    <div className="container-x pb-24 pt-28 md:pt-36">
      <header className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow className="mb-6">
            {loading ? "Searching…" : `${total} vehicle${total !== 1 ? "s" : ""} available`}
          </Eyebrow>
          <h1 className="display text-6xl md:text-8xl lg:text-9xl">
            <SplitText key={title} lines={[title + "."]} />
          </h1>
        </div>

        <form
          onSubmit={handleAISearch}
          className="flex w-full items-center gap-2 rounded-full border border-line/15 p-1.5 pl-5 transition-colors focus-within:border-ink md:max-w-md"
        >
          <Sparkles size={16} className="shrink-0 text-accent" />
          <input
            type="text"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            placeholder={`Electric car under ₹2000${platform.cities[0] ? ` in ${platform.cities[0]}` : ""}`}
            aria-label="Describe the vehicle you need"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted"
          />
          {nlQuery && (
            <button type="button" onClick={() => setNlQuery("")} aria-label="Clear search" className="text-muted hover:text-ink">
              <X size={16} />
            </button>
          )}
          <button type="submit" disabled={aiSearching} className="btn-primary !px-4 !py-2.5" aria-label="Search">
            {aiSearching ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <ArrowRight size={16} />
            )}
          </button>
        </form>
      </header>

      <div className="-mx-5 mb-10 flex flex-wrap items-center gap-2 border-y border-line/10 px-5 py-3 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <div className="flex rounded-full border border-line/15 p-1">
          {[
            ["", "All"],
            ["car", "Cars"],
            ["bike", "Bikes"],
          ].map(([value, label]) => (
            <button
              key={label}
              onClick={() => updateFilter("category", value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filters.category === value ? "bg-ink text-canvas" : "text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select value={filters.city} onChange={(e) => updateFilter("city", e.target.value)} className={field} aria-label="City">
          {CITIES.map((c) => (
            <option key={c} value={c === "All Cities" ? "" : c}>
              {c}
            </option>
          ))}
        </select>

        <select value={filters.fuelType} onChange={(e) => updateFilter("fuelType", e.target.value)} className={field} aria-label="Fuel type">
          {FUEL_TYPES.map((f) => (
            <option key={f} value={f === "All" ? "" : f}>
              {f === "All" ? "All fuels" : f.charAt(0).toUpperCase() + f.slice(1)}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <input type="number" placeholder="Min ₹" value={filters.minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} className={`${field} w-28`} aria-label="Minimum price" />
          <span className="text-muted">–</span>
          <input type="number" placeholder="Max ₹" value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} className={`${field} w-28`} aria-label="Maximum price" />
        </div>

        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="chip">
            <X size={14} /> Clear {activeFilterCount}
          </button>
        )}

        <select value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)} className={`${field} ml-auto`} aria-label="Sort by">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <div className="shimmer aspect-[4/5] rounded-[20px]" />
              <div className="shimmer mt-4 h-5 w-2/3 rounded" />
              <div className="shimmer mt-2 h-3 w-1/3 rounded" />
            </div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="border-t border-line/10 py-24">
          <h3 className="display-tight text-4xl md:text-6xl">Nothing matches that.</h3>
          <p className="mt-4 max-w-md text-muted">Try a different city, widen the price range or describe what you need in plain words.</p>
          <button onClick={clearFilters} className="btn-ghost mt-8">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((v, i) => (
            <VehicleCard key={v._id} vehicle={v} index={i} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-20 flex items-center justify-center gap-2" aria-label="Pagination">
          {[...Array(Math.min(pages, 5))].map((_, i) => (
            <button
              key={i}
              onClick={() => updateFilter("page", i + 1)}
              aria-current={filters.page === i + 1 ? "page" : undefined}
              className={`grid h-11 w-11 place-items-center rounded-full font-mono text-sm transition-colors ${
                filters.page === i + 1 ? "bg-ink text-canvas" : "border border-line/15 text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
