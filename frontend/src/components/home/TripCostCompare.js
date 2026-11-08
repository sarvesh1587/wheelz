import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, animate, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import usePlatformStats from "../../hooks/usePlatformStats";
import { EASE } from "../motion";

// Indicative 2026 rates for an Ola/Uber-style outstation sedan: billed on a
// 250 km/day minimum plus driver allowance. Tolls are the same either way.
const CAB_PER_KM = 13;
const CAB_MIN_KM_PER_DAY = 250;
const DRIVER_PER_DAY = 300;
const LOCAL_KM_PER_DAY = 40;
const FUEL_PER_KM = 103 / 15; // petrol ₹/L ÷ km/L
const FALLBACK_DAY = 1800;

const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function Counter({ value, className = "" }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduce) {
      from.current = value;
      return setShown(value);
    }
    const c = animate(from.current, value, {
      duration: 0.6,
      ease: EASE,
      onUpdate: (v) => {
        from.current = v;
        setShown(v);
      },
    });
    return () => c.stop();
  }, [value, reduce]);
  return <span className={className}>{inr(shown)}</span>;
}

export default function TripCostCompare() {
  const platform = usePlatformStats();
  const [km, setKm] = useState(150);
  const [days, setDays] = useState(3);

  // An affordable car from the live fleet (cheaper quarter), so the number is real.
  const dayRate = useMemo(() => {
    const prices = platform.fleet
      .filter((v) => v.category === "car")
      .map((v) => v.currentPrice || v.basePrice)
      .filter((p) => p > 0)
      .sort((a, b) => a - b);
    return prices.length ? Math.round(prices[Math.floor((prices.length - 1) / 4)] / 10) * 10 : FALLBACK_DAY;
  }, [platform.fleet]);

  const driven = km * 2 + LOCAL_KM_PER_DAY * days;
  const wheelz = dayRate * days + driven * FUEL_PER_KM;
  const cab = Math.max(driven, CAB_MIN_KM_PER_DAY * days) * CAB_PER_KM + DRIVER_PER_DAY * days;
  const saved = cab - wheelz;
  const max = Math.max(wheelz, cab);

  const rows = [
    { label: "Wheelz", total: wheelz, me: true },
    { label: "Ola / Uber", total: cab },
  ];

  return (
    <section className="container-x mt-12 md:mt-16">
      <div className="relative overflow-hidden rounded-[32px] border border-line/10 bg-surface p-6 md:p-10">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[120px]" />

        <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <p className="eyebrow mb-4 flex items-center gap-3">
              <span className="text-accent">(02)</span> Trip cost
            </p>
            <h2 className="display text-4xl md:text-6xl">
              Skip the <span className="text-accent">cab.</span>
            </h2>
            <p className="mt-3 max-w-sm text-sm text-muted">See what an outstation trip costs with Wheelz versus Ola or Uber.</p>

            <div className="mt-8 space-y-6">
              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <label htmlFor="trip-km" className="eyebrow">Distance, one way</label>
                  <span className="display-tight text-2xl tabular-nums">{km} km</span>
                </div>
                <input id="trip-km" type="range" min={20} max={800} step={10} value={km} onChange={(e) => setKm(Number(e.target.value))} className="w-full accent-[rgb(var(--accent))]" />
              </div>

              <div className="flex items-center justify-between">
                <span className="eyebrow">Days</span>
                <div className="flex items-center gap-4 rounded-full border border-line/15 p-1">
                  <button type="button" onClick={() => setDays(Math.max(1, days - 1))} disabled={days <= 1} aria-label="Fewer days" className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-accent hover:text-accent-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current">
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-medium tabular-nums">{days}</span>
                  <button type="button" onClick={() => setDays(Math.min(7, days + 1))} disabled={days >= 7} aria-label="More days" className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-accent hover:text-accent-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 lg:self-end">
            <ul className="space-y-4">
              {rows.map((r) => (
                <li key={r.label}>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className={r.me ? "font-medium" : "text-muted"}>{r.label}</span>
                    <Counter value={r.total} className="display-tight text-2xl tabular-nums" />
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-line/10">
                    <motion.div className={`h-full rounded-full ${r.me ? "bg-accent" : "bg-line/30"}`} initial={false} animate={{ width: `${(r.total / max) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-line/10 pt-6">
              <div>
                <p className="eyebrow">{saved > 0 ? "You save" : "Cab is cheaper by"}</p>
                <p className="display mt-1 text-5xl text-accent md:text-6xl">
                  <Counter value={Math.abs(saved)} />
                </p>
              </div>
              <Link to="/vehicles?category=car" className="btn-primary">
                Find a car <ArrowUpRight size={16} />
              </Link>
            </div>

            <p className="mt-4 text-[11px] text-muted">
              Round trip with fuel, Wheelz car at {inr(dayRate)}/day. Cab at ₹13/km, 250 km/day minimum and ₹300/day driver. Indicative rates.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
