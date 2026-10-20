import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, BadgeCheck, Quote, Star } from "lucide-react";
import { reviewAPI, vehicleAPI } from "../services/api";
import { Reveal, SplitText, Marquee, Eyebrow, EASE } from "./motion";

const SPOTLIGHT_MS = 7000;

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
    <figure className="group mr-5 flex w-[320px] shrink-0 flex-col rounded-[24px] border border-line/10 bg-surface p-6 transition-colors duration-500 hover:border-accent/60 md:w-[400px] md:p-7">
      <div className="flex items-center justify-between">
        <Stars value={review.rating} />
        <Quote size={20} className="text-accent/40 transition-colors group-hover:text-accent" />
      </div>
      <blockquote className="mt-5 line-clamp-4 text-base leading-relaxed text-ink md:text-lg">“{textOf(review)}”</blockquote>
      <figcaption className="mt-auto flex items-center gap-3 border-t border-line/10 pt-5">
        <Avatar name={review.user?.name} className="h-10 w-10" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <span className="truncate">{review.user?.name || "Wheelz renter"}</span>
            {review.isVerified && <BadgeCheck size={14} className="shrink-0 text-accent" aria-label="Verified rental" />}
          </span>
          <span className="eyebrow block truncate">
            {v?.name ? `${v.name} · ` : ""}
            {formatDate(review.createdAt)}
          </span>
        </span>
        {v?.images?.[0] && <img src={v.images[0]} alt="" className="h-10 w-14 shrink-0 rounded-lg object-cover" />}
      </figcaption>
    </figure>
  );
}

function Spotlight({ reviews }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const review = reviews[i];
  const v = review.vehicleInfo;

  useEffect(() => {
    if (reviews.length < 2) return undefined;
    const id = setTimeout(() => setI((n) => (n + 1) % reviews.length), SPOTLIGHT_MS);
    return () => clearTimeout(id);
  }, [i, reviews.length]);

  const go = (d) => setI((n) => (n + d + reviews.length) % reviews.length);

  return (
    <div
      className="relative grid overflow-hidden rounded-[32px] border border-line/10 bg-surface lg:grid-cols-12"
    >
      <div className="relative min-h-[240px] overflow-hidden bg-raised lg:col-span-5 lg:min-h-[480px]">
        <AnimatePresence initial={false}>
          <motion.img
            key={review._id}
            src={v?.images?.[0] || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=70"}
            alt={v?.name || ""}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {v?.name && (
          <Link
            to={`/vehicles/${v._id}`}
            className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-full bg-black/40 py-2 pl-4 pr-2 text-sm text-white backdrop-blur-md transition-colors hover:bg-black/60"
          >
            <span className="truncate">Reviewed: {v.name}</span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
              <ArrowRight size={14} />
            </span>
          </Link>
        )}
      </div>

      <div className="flex flex-col p-7 md:p-12 lg:col-span-7">
        <div className="flex items-center justify-between">
          <Stars value={review.rating} size={18} />
          <span className="font-mono text-xs text-muted">
            {String(i + 1).padStart(2, "0")} / {String(reviews.length).padStart(2, "0")}
          </span>
        </div>

        <div className="relative mt-8 flex-1">
          <Quote size={56} className="absolute -left-2 -top-4 text-accent/15" aria-hidden />
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={review._id}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="display-tight relative text-2xl leading-snug md:text-4xl"
            >
              {review.title && textOf(review) !== review.title && (
                <span className="mb-4 block font-sans text-sm font-semibold uppercase tracking-[0.14em] text-accent">
                  {review.title}
                </span>
              )}
              “{textOf(review)}”
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-line/10 pt-6">
          <div className="flex items-center gap-3">
            <Avatar name={review.user?.name} className="h-12 w-12 text-sm" />
            <div>
              <p className="flex items-center gap-1.5 font-semibold">
                {review.user?.name || "Wheelz renter"}
                {review.isVerified && <BadgeCheck size={16} className="text-accent" />}
              </p>
              <p className="eyebrow">{review.isVerified ? "Verified rental" : "Renter"} · {formatDate(review.createdAt)}</p>
            </div>
          </div>
          {reviews.length > 1 && (
            <div className="flex gap-2">
              <button onClick={() => go(-1)} aria-label="Previous review" className="grid h-11 w-11 place-items-center rounded-full border border-line/15 transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink">
                <ArrowLeft size={16} />
              </button>
              <button onClick={() => go(1)} aria-label="Next review" className="grid h-11 w-11 place-items-center rounded-full border border-line/15 transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink">
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {reviews.length > 1 && (
          <div className="mt-6 flex gap-1.5" aria-hidden>
            {reviews.map((r, n) => (
              <button key={r._id} onClick={() => setI(n)} className="h-1 flex-1 overflow-hidden rounded-full bg-line/10" tabIndex={-1}>
                <motion.span
                  key={`${r._id}-${i}`}
                  className="block h-full bg-accent"
                  initial={{ width: n < i ? "100%" : "0%" }}
                  animate={{ width: n <= i ? "100%" : "0%" }}
                  transition={n === i ? { duration: SPOTLIGHT_MS / 1000, ease: "linear" } : { duration: 0 }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Spotlight: the best-rated, most substantial reviews.
  const spotlight = useMemo(
    () =>
      [...reviews]
        .sort((a, b) => b.rating - a.rating || textOf(b).length - textOf(a).length)
        .slice(0, 5),
    [reviews],
  );
  const rowA = reviews.filter((_, n) => n % 2 === 0);
  const rowB = reviews.filter((_, n) => n % 2 === 1);

  if (loading) {
    return (
      <section className="container-x py-24">
        <div className="shimmer h-[420px] rounded-[32px]" />
      </section>
    );
  }

  return (
    <section id="reviews-section" className="overflow-hidden py-24 md:py-36">
      <div className="container-x">
        <div className="mb-14 grid gap-12 md:mb-16 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow index="05" className="mb-6">
              Reviews
            </Eyebrow>
            <h2 className="display text-5xl md:text-7xl lg:text-8xl">
              <SplitText lines={["Said by people", "who drove it."]} inView />
            </h2>
          </div>

          {total > 0 && (
            <Reveal className="rounded-[28px] border border-line/10 bg-surface p-6 lg:col-span-5 md:p-8">
              <div className="flex items-end gap-8">
                <div>
                  <p className="display text-7xl text-accent md:text-8xl">{average.toFixed(1)}</p>
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
                        <motion.span
                          className="block h-full rounded-full bg-accent"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(count / total) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: EASE, delay: (5 - star) * 0.08 }}
                        />
                      </span>
                      <span className="w-5 text-right">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>

        {spotlight.length > 0 ? (
          <Reveal>
            <Spotlight reviews={spotlight} />
          </Reveal>
        ) : (
          <div className="rounded-[28px] border border-dashed border-line/20 p-10 text-center">
            <p className="display-tight text-2xl">No reviews yet.</p>
            <p className="mt-2 text-muted">Complete a booking and be the first to share how it went.</p>
          </div>
        )}
      </div>

      {total >= 4 && (
        <div className="mt-16 space-y-5 md:mt-20">
          <Marquee className="[&>div]:[animation-duration:80s] hover:[&>div]:[animation-play-state:paused]">
            {rowA.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </Marquee>
          {rowB.length >= 2 && (
            <Marquee reverse className="[&>div]:[animation-duration:90s] hover:[&>div]:[animation-play-state:paused]">
              {rowB.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </Marquee>
          )}
        </div>
      )}
    </section>
  );
}
