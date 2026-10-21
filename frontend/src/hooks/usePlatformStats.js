import { useEffect, useState } from "react";
import { vehicleAPI } from "../services/api";

// Real platform numbers derived from the live fleet, so marketing copy never
// claims more cities or vehicles than actually exist. Fetched once per page load.
let cache = null;

function load() {
  if (!cache) {
    cache = vehicleAPI
      .getAll({ limit: 500 })
      .then((res) => {
        const vehicles = res.data.vehicles || [];
        // Listings are typed by owners ("pune", "Pune "), so dedupe case-insensitively.
        const titleCase = (c) => c.trim().toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
        const cities = [...new Set(vehicles.map((v) => v.city && titleCase(v.city)).filter(Boolean))].sort();
        const reviews = vehicles.reduce((s, v) => s + (v.totalReviews || 0), 0);
        const ratingSum = vehicles.reduce((s, v) => s + (v.averageRating || 0) * (v.totalReviews || 0), 0);
        return {
          ready: true,
          // Full list with normalised city names, for components that match against the fleet.
          fleet: vehicles.map((v) => ({ ...v, city: v.city ? titleCase(v.city) : v.city })),
          vehicles: res.data.total ?? vehicles.length,
          cars: vehicles.filter((v) => v.category === "car").length,
          bikes: vehicles.filter((v) => v.category === "bike").length,
          cities,
          reviews,
          rating: reviews ? ratingSum / reviews : null,
        };
      })
      .catch(() => {
        cache = null;
        return { ready: false, fleet: [], vehicles: 0, cars: 0, bikes: 0, cities: [], reviews: 0, rating: null };
      });
  }
  return cache;
}

export default function usePlatformStats() {
  const [stats, setStats] = useState({ ready: false, fleet: [], vehicles: 0, cars: 0, bikes: 0, cities: [], reviews: 0, rating: null });
  useEffect(() => {
    let alive = true;
    load().then((s) => alive && setStats(s));
    return () => {
      alive = false;
    };
  }, []);
  return stats;
}

// "Pune, Bangalore and Mumbai"
export function joinCities(cities) {
  if (cities.length <= 1) return cities[0] || "";
  return `${cities.slice(0, -1).join(", ")} and ${cities[cities.length - 1]}`;
}
