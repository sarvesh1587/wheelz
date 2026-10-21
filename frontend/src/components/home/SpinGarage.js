import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Hand, MapPin, Star } from "lucide-react";
import usePlatformStats from "../../hooks/usePlatformStats";
import { EASE } from "../motion";

const MAX_CARDS = 12;
const DRAG_SPEED = 0.25; // degrees per pixel
const priceOf = (v) => v.currentPrice || v.basePrice || 0;
const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function useCardSize() {
  const get = () => (typeof window !== "undefined" && window.innerWidth < 640 ? { w: 150, h: 200 } : { w: 220, h: 290 });
  const [size, setSize] = useState(get);
  useEffect(() => {
    const onResize = () => setSize(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

// One card on the ring. It brightens and grows as it turns to face the viewer.
function RingCard({ v, index, step, radius, angle, size, onSelect }) {
  const base = index * step;
  const facing = useTransform(angle, (a) => Math.cos(((base + a) * Math.PI) / 180));
  const scale = useTransform(facing, [-1, 0, 1], [0.8, 0.86, 1.08]);
  const brightness = useTransform(facing, [-1, 0.3, 1], [0.35, 0.55, 1]);
  const filter = useTransform(brightness, (b) => `brightness(${b})`);

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width: size.w,
        height: size.h,
        marginLeft: -size.w / 2,
        marginTop: -size.h / 2,
        transform: `rotateY(${base}deg) translateZ(${radius}px)`,
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
    >
      <motion.button
        type="button"
        onClick={() => onSelect(index)}
        style={{ scale, filter }}
        aria-label={`Show ${v.name}`}
        className="group relative block h-full w-full overflow-hidden rounded-[22px] border border-white/10 bg-raised text-left shadow-2xl shadow-black/40"
      >
        <img
          src={v.images?.[0]}
          alt=""
          draggable={false}
          className="h-full w-full select-none object-cover"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-black/10" />
        <span className="absolute inset-x-3 bottom-3 text-white">
          <span className="display-tight block truncate text-sm sm:text-base">{v.name}</span>
          <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-white/70">
            {inr(priceOf(v))}/day
          </span>
        </span>
      </motion.button>
    </div>
  );
}

export default function SpinGarage() {
  const platform = usePlatformStats();
  const reduce = useReducedMotion();
  const size = useCardSize();
  const [kind, setKind] = useState("all");

  const cars = useMemo(() => {
    const list = platform.fleet
      .filter((v) => v.isAvailable !== false && v.images?.[0])
      .filter((v) => kind === "all" || v.category === kind)
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    return list.slice(0, MAX_CARDS);
  }, [platform.fleet, kind]);

  const n = Math.max(cars.length, 1);
  const step = 360 / n;
  // Distance from the centre so neighbouring cards don't overlap; a few cards
  // still get a reasonable ring rather than collapsing onto each other.
  const radius = n === 1 ? 0 : Math.max(Math.round((size.w + 28) / (2 * Math.tan(Math.PI / n))), Math.round(size.w * 0.9));

  const angle = useMotionValue(0);
  const [active, setActive] = useState(0);
  const drag = useRef({ x: 0, start: 0, moved: 0, last: 0, t: 0, v: 0 });

  // Track which card faces front.
  useEffect(
    () =>
      angle.on("change", (a) => {
        const i = ((Math.round(-a / step) % n) + n) % n;
        setActive((prev) => (prev === i ? prev : i));
      }),
    [angle, step, n],
  );

  // New filter: reset to the first card.
  useEffect(() => {
    angle.set(0);
    setActive(0);
  }, [kind, angle]);

  const snapTo = (target) => {
    animate(angle, target, reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 });
  };
  const goTo = (i) => {
    // Shortest way round to card i.
    const current = angle.get();
    let target = -i * step;
    while (target - current > 180) target -= 360;
    while (target - current < -180) target += 360;
    snapTo(target);
  };
  const nudge = (dir) => snapTo(Math.round(angle.get() / step) * step - dir * step);

  const onPointerDown = (e) => {
    if (cars.length < 2) return;
    angle.stop();
    drag.current = { x: e.clientX, start: angle.get(), moved: 0, last: e.clientX, t: performance.now(), v: 0, down: true };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.x;
    d.moved = Math.max(d.moved, Math.abs(dx));
    angle.set(d.start + dx * DRAG_SPEED);
    const now = performance.now();
    const dt = Math.max(1, now - d.t);
    d.v = ((e.clientX - d.last) * DRAG_SPEED * 1000) / dt; // deg/sec
    d.last = e.clientX;
    d.t = now;
  };
  const onPointerUp = () => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    // Throw with momentum, then settle on the nearest card.
    const projected = angle.get() + d.v * 0.35;
    snapTo(Math.round(projected / step) * step);
  };
  const onCardSelect = (i) => {
    if (drag.current.moved > 6) return; // it was a drag, not a tap
    goTo(i);
  };

  const onKey = (e) => {
    if (e.key === "ArrowLeft") nudge(-1);
    if (e.key === "ArrowRight") nudge(1);
  };

  const car = cars[active];

  return (
    <section className="container-x mt-12 md:mt-16">
      <div className="relative overflow-hidden rounded-[32px] border border-line/10 bg-surface">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[120px]"
        />

        {/* Header */}
        <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-10">
          <div>
            <p className="eyebrow mb-4 flex items-center gap-3">
              <span className="text-accent">(02)</span> The garage
            </p>
            <h2 className="display text-4xl md:text-6xl">
              Spin the <span className="text-accent">garage.</span>
            </h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-muted">
              <Hand size={14} className="text-accent" /> Drag to spin. Tap a car to bring it front.
            </p>
          </div>
          <div className="flex rounded-full border border-line/15 p-1">
            {[
              ["all", "All"],
              ["car", "Cars"],
              ["bike", "Bikes"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value)}
                aria-pressed={kind === value}
                className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  kind === value ? "text-accent-ink" : "text-muted hover:text-ink"
                }`}
              >
                {kind === value && (
                  <motion.span layoutId="garage-kind" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                )}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stage */}
        {!platform.ready ? (
          <div className="relative mx-6 mb-10 h-[300px] rounded-[24px] shimmer md:mx-10 md:h-[420px]" />
        ) : cars.length === 0 ? (
          <p className="relative px-6 pb-10 text-muted md:px-10">No vehicles available right now.</p>
        ) : (
          <>
            <div
              role="listbox"
              tabIndex={0}
              aria-label="Vehicle garage, use left and right arrow keys to spin"
              onKeyDown={onKey}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onPointerLeave={onPointerUp}
              className="relative h-[300px] cursor-grab touch-pan-y select-none outline-none active:cursor-grabbing sm:h-[420px]"
              style={{ perspective: 1400 }}
            >
              {/* Floor reflection */}
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-4 left-1/2 h-16 w-[70%] -translate-x-1/2 rounded-[50%] bg-black/40 blur-2xl dark:bg-black/60"
              />
              <motion.div
                className="absolute inset-0"
                style={{ rotateY: angle, transformStyle: "preserve-3d", z: -radius }}
              >
                {cars.map((v, i) => (
                  <RingCard
                    key={v._id}
                    v={v}
                    index={i}
                    step={step}
                    radius={radius}
                    angle={angle}
                    size={size}
                    onSelect={onCardSelect}
                  />
                ))}
              </motion.div>
            </div>

            {/* Front car details */}
            <div className="relative flex flex-col gap-6 border-t border-line/10 p-6 md:flex-row md:items-center md:justify-between md:p-10">
              <div className="min-w-0">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={car?._id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <p className="eyebrow mb-2">
                      {String(active + 1).padStart(2, "0")} / {String(cars.length).padStart(2, "0")} · {car?.subCategory || car?.category}
                    </p>
                    <h3 className="display-tight truncate text-3xl md:text-4xl">{car?.name}</h3>
                    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} /> {car?.city}
                      </span>
                      <span className="capitalize">
                        {car?.transmission} · {car?.fuelType}
                      </span>
                      {car?.totalReviews > 0 && (
                        <span className="flex items-center gap-1 text-ink">
                          <Star size={13} className="fill-accent text-accent" />
                          {Number(car.averageRating || 0).toFixed(1)}
                        </span>
                      )}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex w-full flex-wrap items-center gap-3 md:w-auto md:flex-nowrap">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={car?._id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="display mr-auto whitespace-nowrap text-3xl md:mr-2"
                  >
                    {car && inr(priceOf(car))}
                    <span className="font-sans text-xs font-normal text-muted"> /day</span>
                  </motion.p>
                </AnimatePresence>
                {cars.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => nudge(-1)}
                      aria-label="Previous vehicle"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line/15 transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => nudge(1)}
                      aria-label="Next vehicle"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line/15 transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </>
                )}
                {car && (
                  <Link to={`/vehicles/${car._id}`} className="btn-primary w-full whitespace-nowrap !px-5 md:w-auto">
                    Book this ride <ArrowUpRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
