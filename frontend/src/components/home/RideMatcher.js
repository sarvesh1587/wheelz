import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  animate,
} from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, MapPin, Minus, Plus, Route, Sun } from "lucide-react";
import usePlatformStats from "../../hooks/usePlatformStats";
import { EASE } from "../motion";

// How well each vehicle type suits a trip (0-3).
const TRIPS = [
  {
    id: "city",
    label: "City",
    desc: "Errands, office, nights out",
    icon: Building2,
    fit: { scooter: 3, sports: 2, hatchback: 3, cruiser: 1, sedan: 1, suv: 1, luxury: 1 },
  },
  {
    id: "weekend",
    label: "Weekend",
    desc: "Short getaways, 1–3 days",
    icon: Sun,
    fit: { cruiser: 3, suv: 3, sedan: 2, hatchback: 2, luxury: 2, sports: 2, scooter: 1 },
  },
  {
    id: "highway",
    label: "Highway",
    desc: "Long drives, comfort first",
    icon: Route,
    fit: { suv: 3, sedan: 3, luxury: 3, cruiser: 2, hatchback: 1, sports: 1, scooter: 0 },
  },
];

const priceOf = (v) => v.currentPrice || v.basePrice || 0;
const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function score(v, { trip, people, budget, city }) {
  const t = TRIPS.find((x) => x.id === trip);
  const type = String(v.subCategory || v.category || "").toLowerCase();
  const seats = v.category === "bike" ? 2 : v.seatingCapacity || 4;
  if (seats < people) return null;
  if (city !== "Any" && v.city !== city) return null;
  if (v.isAvailable === false) return null;

  const price = priceOf(v);
  let s = (t.fit[type] ?? 1) * 18; // up to 54
  const over = price - budget;
  s += over <= 0 ? 25 : Math.max(0, 25 - (over / budget) * 60);
  if (trip === "highway" && v.transmission === "automatic") s += 6;
  if (trip === "city" && v.fuelType === "electric") s += 6;
  if (people > 1 && seats - people <= 1) s += 4; // snug fit, no wasted seats
  s += Math.min(10, (v.averageRating || 0) * 2);
  return { score: Math.min(99, Math.round(s)), over: Math.max(0, over) };
}

function Stepper({ label, value, min, max, onChange, unit }) {
  return (
    <div>
      <p className="field-label mb-3">{label}</p>
      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Fewer ${unit}`}
          className="grid h-9 w-9 place-items-center rounded-full border border-line/15 transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink sm:h-11 sm:w-11 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          <Minus size={16} />
        </button>
        <div className="relative h-12 w-10 overflow-hidden text-center sm:w-14">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="display absolute inset-0 grid place-items-center text-4xl"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`More ${unit}`}
          className="grid h-9 w-9 place-items-center rounded-full border border-line/15 transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink sm:h-11 sm:w-11 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          <Plus size={16} />
        </button>
        <span className="eyebrow hidden sm:inline">{unit}</span>
      </div>
    </div>
  );
}

// Card that leans toward the pointer.
function TiltCard({ v, match, days, dragging }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 200, damping: 18 });
  const glare = useTransform(mx, (x) => `radial-gradient(circle at ${x * 100}% 30%, rgba(255,255,255,0.45), transparent 55%)`);

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const price = priceOf(v);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
      transition={{ duration: 0.6, ease: EASE }}
      className="w-[78vw] max-w-[320px] shrink-0 [perspective:900px] sm:w-[300px]"
    >
      <motion.div
        ref={ref}
        onPointerMove={(e) => (dragging.current ? reset() : onMove(e))}
        onPointerLeave={reset}
        onPointerUp={reset}
        onPointerCancel={reset}
        style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group relative overflow-hidden rounded-[28px] border border-line/10 bg-canvas"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-raised">
          <img
            src={v.images?.[0]}
            alt={v.name}
            draggable={false}
            className="h-full w-full select-none object-cover transition-transform duration-700 ease-out-expo group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glare }}
          />
          <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 font-mono text-[11px] font-semibold text-accent-ink">
            {match.score}% match
          </span>
          <span className="absolute bottom-4 left-4 rounded-full bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur-md">
            {v.subCategory || v.category}
          </span>
        </div>

        <div className="p-5" style={{ transform: "translateZ(30px)" }}>
          <h3 className="display-tight truncate text-xl">{v.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <MapPin size={12} /> {v.city} · {v.transmission} · {v.fuelType}
          </p>
          <div className="mt-5 flex items-end justify-between border-t border-line/10 pt-4">
            <div>
              <p className="display text-2xl">
                {inr(price)}
                <span className="font-sans text-xs font-normal text-muted"> /day</span>
              </p>
              <p className="mt-1 text-xs text-muted">
                {inr(price * days)} for {days} day{days > 1 ? "s" : ""}
                {match.over > 0 && <span className="text-accent"> · {inr(match.over)} over</span>}
              </p>
            </div>
            <Link
              to={`/vehicles/${v._id}`}
              onClick={(e) => dragging.current && e.preventDefault()}
              draggable={false}
              aria-label={`View ${v.name}`}
              className="grid h-11 w-11 place-items-center rounded-full bg-ink text-canvas transition-colors hover:bg-accent hover:text-accent-ink"
            >
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

export default function RideMatcher() {
  const platform = usePlatformStats();
  const fleet = platform.fleet;
  const prices = fleet.map(priceOf).filter(Boolean);
  const minPrice = prices.length ? Math.floor(Math.min(...prices) / 100) * 100 : 200;
  const maxPrice = prices.length ? Math.ceil(Math.max(...prices) / 100) * 100 : 10000;

  const [trip, setTrip] = useState("weekend");
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(2);
  const [budget, setBudget] = useState(null);
  const [city, setCity] = useState("Any");
  const effectiveBudget = budget ?? Math.min(maxPrice, 2500);

  const results = useMemo(
    () =>
      fleet
        .map((v) => ({ v, match: score(v, { trip, people, budget: effectiveBudget, city }) }))
        .filter((r) => r.match)
        .sort((a, b) => b.match.score - a.match.score || priceOf(a.v) - priceOf(b.v))
        .slice(0, 10),
    [fleet, trip, people, effectiveBudget, city],
  );
  const inBudget = results.filter((r) => r.match.over === 0).length;

  // Draggable track
  const viewport = useRef(null);
  const track = useRef(null);
  const x = useMotionValue(0);
  const dragging = useRef(false);
  const [bounds, setBounds] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const measure = () => {
      if (!viewport.current || !track.current) return;
      const overflow = track.current.scrollWidth - viewport.current.clientWidth;
      setBounds({ left: -Math.max(0, overflow), right: 0 });
    };
    measure();
    const t = setTimeout(measure, 700);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [results.length]);

  // New filters bring the track back to the first card.
  useEffect(() => {
    animate(x, 0, { duration: 0.6, ease: EASE });
  }, [trip, people, city, effectiveBudget, x]);

  const nudge = (dir) => {
    const step = 316;
    const next = Math.min(bounds.right, Math.max(bounds.left, x.get() - dir * step));
    animate(x, next, { duration: 0.7, ease: EASE });
  };

  const pct = ((effectiveBudget - minPrice) / Math.max(1, maxPrice - minPrice)) * 100;

  return (
    <section className="container-x mt-12 md:mt-16">
      <div className="relative overflow-hidden rounded-[32px] border border-line/10 bg-surface">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/15 blur-[100px]"
        />

        <div className="relative grid gap-10 p-6 md:p-10 lg:grid-cols-12">
          {/* Heading + live count */}
          <div className="lg:col-span-4">
            <p className="eyebrow mb-5 flex items-center gap-3">
              <span className="text-accent">(02)</span> Ride matcher
            </p>
            <h2 className="display text-4xl md:text-5xl">
              Your ride,
              <br />
              <span className="text-muted">in three taps.</span>
            </h2>
            <div className="mt-8 flex items-end gap-3">
              <div className="relative h-[72px] overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={results.length}
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -60, opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="display block text-7xl text-accent"
                  >
                    {platform.ready ? String(results.length).padStart(2, "0") : "—"}
                  </motion.span>
                </AnimatePresence>
              </div>
              <p className="pb-2 text-sm text-muted">
                matches
                <br />
                {inBudget} within budget
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-8 lg:col-span-8">
            <div>
              <p className="field-label mb-3">What kind of trip?</p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {TRIPS.map((t) => {
                  const on = trip === t.id;
                  return (
                    <motion.button
                      key={t.id}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setTrip(t.id)}
                      aria-pressed={on}
                      className={`relative overflow-hidden rounded-[20px] border px-2.5 py-3 text-left transition-colors sm:p-4 ${
                        on ? "border-accent text-accent-ink" : "border-line/15 hover:border-ink"
                      }`}
                    >
                      {on && (
                        <motion.span
                          layoutId="trip-pill"
                          className="absolute inset-0 bg-accent"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative block">
                        <t.icon size={18} className="mb-2 sm:mb-3" />
                        <span className="display-tight block text-[15px] sm:text-xl">{t.label}</span>
                        <span className={`mt-1 hidden text-xs sm:block ${on ? "opacity-70" : "text-muted"}`}>{t.desc}</span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-8">
              <Stepper label="People" value={people} min={1} max={7} onChange={setPeople} unit="people" />
              <Stepper label="Days" value={days} min={1} max={14} onChange={setDays} unit="days" />
            </div>

            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <p className="field-label !mb-0 whitespace-nowrap">Budget per day</p>
                <p className="display whitespace-nowrap text-xl sm:text-2xl">up to {inr(effectiveBudget)}</p>
              </div>
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                step={100}
                value={effectiveBudget}
                onChange={(e) => setBudget(Number(e.target.value))}
                aria-label="Budget per day"
                className="matcher-range w-full"
                style={{ "--pct": `${pct}%` }}
              />
              <div className="mt-2 flex justify-between font-mono text-[11px] text-muted">
                <span>{inr(minPrice)}</span>
                <span>{inr(maxPrice)}</span>
              </div>
            </div>

            {platform.cities.length > 0 && (
              <div>
                <p className="field-label mb-3">Where?</p>
                <div className="flex flex-wrap gap-2">
                  {["Any", ...platform.cities].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCity(c)}
                      aria-pressed={city === c}
                      className={`chip ${city === c ? "!border-accent !bg-accent !text-accent-ink" : ""}`}
                    >
                      {c === "Any" ? "Any city" : c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results carousel */}
        <div className="relative border-t border-line/10 pb-8 pt-6">
          <div className="mb-5 flex items-center justify-between px-6 md:px-10">
            <p className="eyebrow">
              {results.length ? "Drag to explore" : "No exact match"}
              {results.length > 0 && <span className="ml-2 hidden sm:inline">· best match first</span>}
            </p>
            {results.length > 1 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => nudge(-1)}
                  aria-label="Previous"
                  className="grid h-10 w-10 place-items-center rounded-full border border-line/15 transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink"
                >
                  <ArrowLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => nudge(1)}
                  aria-label="Next"
                  className="grid h-10 w-10 place-items-center rounded-full border border-line/15 transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink"
                >
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>

          {!platform.ready ? (
            <div className="flex gap-5 overflow-hidden px-6 md:px-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="shimmer h-[340px] w-[300px] shrink-0 rounded-[28px]" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="px-6 md:px-10">
              <p className="display-tight text-2xl">Nothing fits all of that yet.</p>
              <p className="mt-2 text-sm text-muted">Try fewer people, another city or a higher budget.</p>
              <button type="button" onClick={() => setBudget(maxPrice)} className="btn-ghost mt-5">
                Show every budget
              </button>
            </div>
          ) : (
            <div ref={viewport} className="cursor-grab overflow-hidden px-6 active:cursor-grabbing md:px-10">
              <motion.div
                ref={track}
                drag="x"
                dragConstraints={bounds}
                dragElastic={0.12}
                style={{ x }}
                onDragStart={() => {
                  dragging.current = true;
                }}
                onDragEnd={() => setTimeout(() => (dragging.current = false), 60)}
                className="flex w-max gap-4 pr-6 md:pr-10"
              >
                <AnimatePresence mode="popLayout">
                  {results.map(({ v, match }) => (
                    <TiltCard key={v._id} v={v} match={match} days={days} dragging={dragging} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
