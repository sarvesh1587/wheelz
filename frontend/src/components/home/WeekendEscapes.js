import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import usePlatformStats from "../../hooks/usePlatformStats";
import { EASE } from "../motion";
import { ESCAPES } from "./escapes";

const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

// Cheapest day price per category in a city, from the live fleet.
function fromPrices(fleet, city) {
  const out = {};
  fleet
    .filter((v) => v.city === city && v.isAvailable !== false)
    .forEach((v) => {
      const p = v.currentPrice || v.basePrice;
      if (p > 0 && (!out[v.category] || p < out[v.category])) out[v.category] = p;
    });
  return out;
}

function EscapeCard({ e, city, prices, big, index }) {
  const [loaded, setLoaded] = useState(false);
  // Small cards don't need the 1280px photo.
  const src = big ? e.img : e.img.replace("/1280px-", "/960px-");
  const priceLine = [prices.car && `Cars from ${inr(prices.car)}`, prices.bike && `Bikes from ${inr(prices.bike)}`].filter(Boolean).join(" · ");
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: index * 0.07 }}
      className={`relative min-w-[78%] snap-start sm:min-w-[46%] lg:min-w-0 ${big ? "lg:row-span-2" : ""}`}
    >
      <Link
        to={`/vehicles?city=${encodeURIComponent(city)}`}
        className={`group relative block h-[340px] overflow-hidden rounded-[24px] bg-raised shimmer ${big ? "lg:h-full" : "lg:h-[250px]"}`}
      >
        <img
          src={src}
          alt={e.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-[1200ms] ease-out group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

        <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white backdrop-blur">
          <Clock size={11} /> {e.km} km · {e.time}
        </span>
        <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ArrowUpRight size={18} />
        </span>

        <span className="absolute inset-x-5 bottom-5 text-white">
          <span className={`display-tight block ${big ? "text-[1.7rem] sm:text-4xl lg:text-[2.1rem] 2xl:text-5xl" : "text-[1.7rem] sm:text-3xl"}`}>{e.name}</span>
          <span className="mt-1 block text-sm text-white/75">{e.tagline}</span>
          {priceLine && (
            <span className="mt-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-ink">
              {priceLine}/day
            </span>
          )}
        </span>
      </Link>
      <a
        href={e.source}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-2 right-4 text-[9px] text-white/50 hover:text-white"
      >
        Photo: {e.credit}
      </a>
    </motion.div>
  );
}

export default function WeekendEscapes() {
  const platform = usePlatformStats();

  // Only cities that have vehicles and getaways, busiest first.
  const cities = useMemo(() => {
    const count = {};
    platform.fleet.forEach((v) => {
      if (ESCAPES[v.city]) count[v.city] = (count[v.city] || 0) + 1;
    });
    const list = Object.keys(count).sort((a, b) => count[b] - count[a]);
    return list.length ? list : Object.keys(ESCAPES).slice(0, 4);
  }, [platform.fleet]);

  const [city, setCity] = useState(null);
  useEffect(() => {
    if (!city || !cities.includes(city)) setCity(cities[0]);
  }, [cities, city]);

  const active = city || cities[0];
  const prices = useMemo(() => fromPrices(platform.fleet, active), [platform.fleet, active]);
  const escapes = ESCAPES[active] || [];

  return (
    <section className="container-x mt-12 md:mt-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-4 flex items-center gap-3">
            <span className="text-accent">(02)</span> Weekend escapes
          </p>
          <h2 className="display text-4xl md:text-6xl">
            Go somewhere <span className="text-accent">this weekend.</span>
          </h2>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <MapPin size={14} className="text-accent" /> Pick up in your city, drive out by morning.
          </p>
        </div>

        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:-mx-8 sm:px-8 md:mx-0 md:flex-wrap md:justify-end md:overflow-visible md:px-0">
          {cities.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCity(c)}
              aria-pressed={active === c}
              className={`relative shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active === c ? "border-transparent text-accent-ink" : "border-line/15 text-muted hover:text-ink"
              }`}
            >
              {active === c && (
                <motion.span layoutId="escape-city" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Keyed by city so a switch remounts the cards and replays their entrance. */}
      <div key={active} className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:overflow-visible lg:px-0 lg:pb-0">
        {escapes.map((e, i) => (
          <EscapeCard key={e.name} e={e} city={active} prices={prices} big={i === 0} index={i} />
        ))}
      </div>
    </section>
  );
}
