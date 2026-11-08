import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, animate, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Bike, Bus, Car, Clock, Minus, Plus, TrainFront, CarTaxiFront, Info } from "lucide-react";
import usePlatformStats from "../../hooks/usePlatformStats";
import { EASE } from "../motion";

// Indicative 2026 rates. Rail: Mail/Express 3AC incl. reservation + superfast
// charges after the Dec 2025 revision. Bus: private AC seater/sleeper on
// popular routes. Cab: Ola/Uber-style outstation sedan (SUV for 5+), billed on a
// 250 km/day minimum plus driver allowance; tolls extra.
const RATES = {
  train: { perKm: 1.5, kmh: 55 },
  bus: { perKm: 2.2, kmh: 45 },
  cab: { sedan: 13, suv: 17, minKmPerDay: 250, driverPerDay: 300, kmh: 50 },
  self: { kmh: 55 },
  tollPerKm: 1.2, // cars only, across the round trip
  localPerDay: 500, // autos/cabs at the destination when you arrive without a vehicle
  localKmPerDay: 40, // driving around once you're there
  petrol: 103,
  mileage: { car: 15, bike: 45 },
  fallbackDay: { car: 1800, bike: 600 },
};

const ROUTES = [
  { label: "Pune → Mumbai", km: 150 },
  { label: "Bangalore → Mysore", km: 145 },
  { label: "Delhi → Jaipur", km: 280 },
  { label: "Mumbai → Goa", km: 590 },
  { label: "Chennai → Pondicherry", km: 150 },
];

const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const hrs = (km, kmh) => {
  const h = km / kmh;
  return h < 1 ? `${Math.round(h * 60)} min` : `${Math.round(h * 2) / 2} h`;
};

// Price at a given point of the fleet's day rates (0.5 = median).
function quantile(nums, q) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  return s[lo] + (s[Math.min(lo + 1, s.length - 1)] - s[lo]) * (pos - lo);
}

const TIERS = [
  ["budget", "Budget", 0.25],
  ["typical", "Typical", 0.5],
  ["premium", "Premium", 0.75],
];

function costs({ km, people, days, kind, dayRate }) {
  const round = km * 2;
  const local = RATES.localPerDay * days;

  const train = round * RATES.train.perKm * people + local;
  const bus = round * RATES.bus.perKm * people + local;

  const cabs = Math.ceil(people / 6);
  const cabRate = people > 4 ? RATES.cab.suv : RATES.cab.sedan;
  const billedKm = Math.max(round + RATES.localKmPerDay * days, RATES.cab.minKmPerDay * days);
  const cab = cabs * (billedKm * cabRate + RATES.cab.driverPerDay * days + round * RATES.tollPerKm);

  const seats = kind === "bike" ? 2 : 5;
  const units = Math.ceil(people / seats);
  const driven = round + RATES.localKmPerDay * days;
  const fuel = (driven / RATES.mileage[kind]) * RATES.petrol;
  const toll = kind === "car" ? round * RATES.tollPerKm : 0;
  const self = units * (dayRate * days + fuel + toll);

  return [
    { id: "self", label: "Wheelz", sub: `${units} ${kind}${units > 1 ? "s" : ""}, you drive`, icon: kind === "bike" ? Bike : Car, total: self, time: hrs(km, RATES.self.kmh) },
    { id: "cab", label: "Ola / Uber", sub: `Outstation ${people > 4 ? "SUV" : "sedan"} + driver`, icon: CarTaxiFront, total: cab, time: hrs(km, RATES.cab.kmh) },
    { id: "bus", label: "Bus", sub: "AC seater + local autos", icon: Bus, total: bus, time: hrs(km, RATES.bus.kmh) },
    { id: "train", label: "Train", sub: "3AC + local autos", icon: TrainFront, total: train, time: hrs(km, RATES.train.kmh) },
  ];
}

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

function Stepper({ label, value, min, max, onChange, suffix }) {
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <div className="flex items-center justify-between rounded-full border border-line/15 p-1">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`} className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-accent hover:text-accent-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current">
          <Minus size={14} />
        </button>
        <span className="text-sm font-medium tabular-nums">
          {value} {suffix(value)}
        </span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`} className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-accent hover:text-accent-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function TripCostCompare() {
  const platform = usePlatformStats();
  const [km, setKm] = useState(150);
  const [people, setPeople] = useState(4);
  const [days, setDays] = useState(3);
  const [kind, setKind] = useState("car");
  const [tier, setTier] = useState("budget");

  // Day price from the live fleet, so the comparison uses our real prices.
  const dayRate = useMemo(() => {
    const prices = platform.fleet
      .filter((v) => v.category === kind)
      .map((v) => v.currentPrice || v.basePrice)
      .filter((p) => p > 0);
    const q = TIERS.find((t) => t[0] === tier)[2];
    return Math.round(quantile(prices, q) / 10) * 10 || RATES.fallbackDay[kind];
  }, [platform.fleet, kind, tier]);

  const rows = useMemo(() => costs({ km, people, days, kind, dayRate }), [km, people, days, kind, dayRate]);
  const max = Math.max(...rows.map((r) => r.total));
  const wheelz = rows[0];
  const others = rows.slice(1);
  const cheapestOther = others.reduce((a, b) => (a.total < b.total ? a : b));
  const cab = rows.find((r) => r.id === "cab");
  const savedVsCab = cab.total - wheelz.total;
  const wins = wheelz.total <= cheapestOther.total;

  // When public transport wins, find how many travellers flip it.
  const breakEven = useMemo(() => {
    if (wins) return null;
    for (let p = people + 1; p <= 10; p++) {
      const r = costs({ km, people: p, days, kind, dayRate });
      if (r[0].total <= Math.min(...r.slice(1).map((x) => x.total))) return p;
    }
    return null;
  }, [wins, km, people, days, kind, dayRate]);

  const activeRoute = ROUTES.find((r) => r.km === km)?.label;

  return (
    <section className="container-x mt-12 md:mt-16">
      <div className="relative overflow-hidden rounded-[32px] border border-line/10 bg-surface">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-accent/15 blur-[120px]" />

        <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-10">
          <div>
            <p className="eyebrow mb-4 flex items-center gap-3">
              <span className="text-accent">(02)</span> Trip cost
            </p>
            <h2 className="display text-4xl md:text-6xl">
              Do the <span className="text-accent">math.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted md:text-right">
            Bus, train, cab or your own wheels. Set your trip and see what each one really costs, door to door.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-8 border-t border-line/10 p-6 md:p-10 lg:grid-cols-12 lg:gap-12">
          {/* Controls */}
          <div className="min-w-0 space-y-7 lg:col-span-5">
            <div>
              <p className="eyebrow mb-3">Popular routes</p>
              <div className="flex flex-wrap gap-2">
                {ROUTES.map((r) => (
                  <button key={r.label} type="button" onClick={() => setKm(r.km)} aria-pressed={activeRoute === r.label} className={`chip ${activeRoute === r.label ? "!border-accent !bg-accent !text-accent-ink" : ""}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <label htmlFor="trip-km" className="eyebrow">One-way distance</label>
                <span className="display-tight text-2xl tabular-nums">{km} km</span>
              </div>
              <input id="trip-km" type="range" min={20} max={1000} step={5} value={km} onChange={(e) => setKm(Number(e.target.value))} className="w-full accent-[rgb(var(--accent))]" />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-muted">
                <span>20 km</span>
                <span>1000 km</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Stepper label="Travellers" value={people} min={1} max={6} onChange={setPeople} suffix={(v) => (v === 1 ? "person" : "people")} />
              <Stepper label="Trip length" value={days} min={1} max={7} onChange={setDays} suffix={(v) => (v === 1 ? "day" : "days")} />
            </div>

            <div>
              <p className="eyebrow mb-2">Rent a</p>
              <div className="flex rounded-full border border-line/15 p-1">
                {[
                  ["car", "Car", Car],
                  ["bike", "Bike", Bike],
                ].map(([value, label, Icon]) => (
                  <button key={value} type="button" onClick={() => setKind(value)} aria-pressed={kind === value} className={`relative flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition-colors ${kind === value ? "text-accent-ink" : "text-muted hover:text-ink"}`}>
                    {kind === value && <motion.span layoutId="trip-kind" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                    <Icon size={15} className="relative" />
                    <span className="relative">{label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                {TIERS.map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setTier(value)} aria-pressed={tier === value} className={`chip flex-1 justify-center !py-1.5 text-xs ${tier === value ? "!border-ink !text-ink" : ""}`}>
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">
                A {tier} Wheelz {kind} is about {inr(dayRate)}/day{platform.ready ? " in our live fleet" : ""}.
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="min-w-0 lg:col-span-7">
            <ul className="space-y-3">
              {rows.map((r) => {
                const Icon = r.icon;
                const me = r.id === "self";
                return (
                  <li key={r.id} className={`relative overflow-hidden rounded-2xl border p-4 ${me ? "border-accent/60" : "border-line/10"}`}>
                    <motion.div aria-hidden className={`absolute inset-y-0 left-0 ${me ? "bg-accent/20" : "bg-line/[0.06]"}`} initial={false} animate={{ width: `${(r.total / max) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} />
                    <div className="relative flex items-center gap-4">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${me ? "bg-accent text-accent-ink" : "bg-raised text-ink"}`}>
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{r.label}</p>
                        <p className="truncate text-xs text-muted">
                          {r.sub} · <Clock size={11} className="inline -mt-0.5" /> {r.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <Counter value={r.total} className="display-tight block text-xl tabular-nums md:text-2xl" />
                        <span className="font-mono text-[10px] text-muted">{inr(r.total / people)}/person</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex flex-col gap-5 rounded-2xl bg-ink p-6 text-canvas md:flex-row md:items-center md:justify-between">
              <div>
                {savedVsCab > 0 ? (
                  <>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">You save vs Ola / Uber</p>
                    <p className="display mt-1 text-4xl text-accent md:text-5xl">
                      <Counter value={savedVsCab} />
                    </p>
                  </>
                ) : (
                  <p className="display-tight text-2xl">A cab works out cheaper for this one.</p>
                )}
                <p className="mt-2 max-w-sm text-sm opacity-70">
                  {wins
                    ? `Cheapest way to do this trip, ${inr(cheapestOther.total - wheelz.total)} less than the ${cheapestOther.label.toLowerCase()}, and you leave whenever you want.`
                    : breakEven
                      ? `The ${cheapestOther.label.toLowerCase()} is cheaper for ${people}. With ${breakEven} or more people, Wheelz wins.`
                      : `The ${cheapestOther.label.toLowerCase()} is cheaper here, but you're on its timetable.`}
                </p>
              </div>
              <Link to={`/vehicles?category=${kind}`} className="btn-primary shrink-0 justify-center">
                Find a {kind} <ArrowUpRight size={16} />
              </Link>
            </div>

            <p className="mt-4 flex gap-2 text-[11px] leading-relaxed text-muted">
              <Info size={12} className="mt-0.5 shrink-0" />
              Round trip, indicative 2026 rates: train 3AC ₹1.5/km, AC bus ₹2.2/km per person, plus ₹500/day local autos at the destination. Cab at ₹13/km (SUV ₹17) with a 250 km/day minimum, ₹300/day driver and tolls. Wheelz includes fuel at ₹103/L and tolls. Actual fares vary by route and season.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
