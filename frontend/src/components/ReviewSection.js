import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, ChevronDown, Star } from "lucide-react";
import { reviewAPI, vehicleAPI } from "../services/api";
import { Reveal, SplitText, Eyebrow, EASE } from "./motion";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Recently";

const initials = (name = "U") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const textOf = (r) => r.comment || r.title || "";

function Stars({ value, size = 14 }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} className={s <= value ? "fill-accent text-accent" : "text-line/20"} />
      ))}
    </span>
  );
}

function Avatar({ name, className = "" }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-accent font-mono text-xs font-semibold text-accent-ink ${className}`}>
      {initials(name)}
    </span>
  );
}

function ReviewCard({ review }) {
  const v = review.vehicleInfo;
  return (
    <figure className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-line/10 bg-surface transition-all duration-500 hover:-translate-y-1 hover:border-accent/60">
      <div className="relative h-28 overflow-hidden bg-raised">
        {v?.images?.[0] && (
          <img
            src={v.images[0]}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
          />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {v?.name && (
          <span className="absolute bottom-2.5 left-3 right-3 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/90">
            {v.name}
          </span>
        )}
      </div>
      <Avatar name={review.user?.name} className="absolute right-4 top-[92px] h-10 w-10 ring-4 ring-surface" />
      <div className="flex flex-1 flex-col p-5 pt-4">
        <Stars value={review.rating} size={13} />
        <blockquote className="mt-3 line-clamp-5 text-[15px] leading-relaxed text-ink">“{textOf(review)}”</blockquote>
        <figcaption className="mt-auto flex items-center gap-1.5 pt-4 text-sm">
          <span className="truncate font-semibold">{review.user?.name || "Wheelz renter"}</span>
          {review.isVerified && <BadgeCheck size={14} className="shrink-0 text-accent" aria-label="Verified rental" />}
          <span className="ml-auto shrink-0 text-xs text-muted">{formatDate(review.createdAt)}</span>
        </figcaption>
      </div>
    </figure>
  );
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await vehicleAPI.getAll({ limit: 50 });
        const vehicles = res.data.vehicles || [];
        // Fetch every vehicle's reviews in parallel and remember which vehicle each belongs to.
        const results = await Promise.allSettled(vehicles.map((v) => reviewAPI.getByVehicle(v._id)));
        const all = results
          .flatMap((r, idx) =>
            r.status === "fulfilled"
              ? (r.value.data.reviews || []).map((rev) => ({ ...rev, vehicleInfo: vehicles[idx] }))
              : [],
          )
          .filter((r) => textOf(r).trim())
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (!cancelled) setReviews(all);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = reviews.length;
  const average = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));

  // Best-rated, most substantial reviews first; four on screen until expanded.
  const ordered = useMemo(
    () => [...reviews].sort((a, b) => b.rating - a.rating || textOf(b).length - textOf(a).length),
    [reviews],
  );
  const visible = showAll ? ordered : ordered.slice(0, 4);

  if (loading) {
    return (
      <section className="container-x py-24">
        <div className="shimmer h-[420px] rounded-[32px]" />
      </section>
    );
  }

  return (
    <section id="reviews-section" className="py-20 md:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-8 md:mb-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow index="05" className="mb-6">
              Reviews
            </Eyebrow>
            <h2 className="display text-4xl md:text-6xl">
              <SplitText lines={["Said by people", "who drove it."]} inView />
            </h2>
          </div>

          {total > 0 && (
            <Reveal className="rounded-[24px] border border-line/10 bg-surface p-5 lg:col-span-5">
              <div className="flex items-end gap-6">
                <div>
                  <p className="display text-6xl text-accent">{average.toFixed(1)}</p>
                  <div className="mt-3">
                    <Stars value={Math.round(average)} />
                  </div>
                  <p className="eyebrow mt-2">
                    {total} review{total === 1 ? "" : "s"}
                  </p>
                </div>
                <ul className="flex-1 space-y-2.5 pb-1">
                  {distribution.map(({ star, count }) => (
                    <li key={star} className="flex items-center gap-3 font-mono text-[11px] text-muted">
                      <span className="flex w-6 items-center gap-0.5">
                        {star}
                        <Star size={9} className="fill-current" />
                      </span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/10">
                        <span className="block h-full rounded-full bg-accent" style={{ width: `${(count / total) * 100}%` }} />
                      </span>
                      <span className="w-5 text-right">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>

        {total === 0 ? (
          <div className="rounded-[28px] border border-dashed border-line/20 p-10 text-center">
            <p className="display-tight text-2xl">No reviews yet.</p>
            <p className="mt-2 text-muted">Complete a booking and be the first to share how it went.</p>
          </div>
        ) : (
          <>
            <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AnimatePresence initial={false}>
                {visible.map((review, i) => (
                  <motion.div
                    key={review._id}
                    layout
                    exit={{ opacity: 0, y: 12, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.6, ease: EASE, delay: (i % 4) * 0.06 }}
                  >
                    <ReviewCard review={review} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {total > 4 && (
              <div className="mt-8 flex justify-center">
                <button onClick={() => setShowAll((v) => !v)} className="btn-ghost">
                  {showAll ? "Show less" : `View all ${total} reviews`}
                  <ChevronDown size={16} className={`transition-transform duration-300 ${showAll ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </section>
  );
}
