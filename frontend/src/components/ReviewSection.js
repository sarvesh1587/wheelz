import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { reviewAPI } from "../services/api";
import { Reveal, SplitText, Marquee, Eyebrow } from "./motion";

const API = process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "Recently";

const initials = (name = "U") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

function Stars({ value, size = 14 }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= value ? "fill-accent text-accent" : "text-line/20"}
        />
      ))}
    </span>
  );
}

function ReviewCard({ review }) {
  return (
    <figure className="mr-5 flex h-full w-[340px] shrink-0 flex-col justify-between rounded-[20px] border border-line/10 bg-surface p-7 md:w-[420px]">
      <div>
        <Stars value={review.rating} />
        <blockquote className="display-tight mt-5 text-xl leading-snug md:text-2xl">
          “{review.comment || review.title || "Smooth booking and a spotless vehicle."}”
        </blockquote>
      </div>
      <figcaption className="mt-8 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-raised font-mono text-xs">
          {initials(review.user?.name)}
        </span>
        <span>
          <span className="block text-sm font-semibold">
            {review.user?.name || "Wheelz renter"}
            {review.isVerified && <span className="ml-2 text-xs font-normal text-accent">Verified</span>}
          </span>
          <span className="eyebrow">{formatDate(review.createdAt)}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/vehicles?limit=50`);
        const { vehicles = [] } = await res.json();
        // Fetch every vehicle's reviews in parallel rather than one by one.
        const results = await Promise.allSettled(
          vehicles.map((v) => reviewAPI.getByVehicle(v._id)),
        );
        const all = results
          .flatMap((r) => (r.status === "fulfilled" ? r.value.data.reviews || [] : []))
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
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  if (loading) {
    return (
      <section className="container-x py-24">
        <div className="shimmer h-64 rounded-[28px]" />
      </section>
    );
  }

  return (
    <section id="reviews-section" className="overflow-hidden py-24 md:py-36">
      <div className="container-x">
        <div className="mb-14 grid gap-12 md:mb-20 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow index="05" className="mb-6">
              Reviews
            </Eyebrow>
            <h2 className="display text-5xl md:text-7xl lg:text-8xl">
              <SplitText lines={["Said by people", "who drove it."]} inView />
            </h2>
          </div>

          {total > 0 && (
            <Reveal className="flex items-end gap-8 lg:col-span-4 lg:col-start-9">
              <div>
                <p className="display text-7xl md:text-8xl">{average.toFixed(1)}</p>
                <div className="mt-3">
                  <Stars value={Math.round(average)} />
                </div>
                <p className="eyebrow mt-2">{total} reviews</p>
              </div>
              <ul className="flex-1 space-y-2 pb-1">
                {distribution.map(({ star, count }) => (
                  <li key={star} className="flex items-center gap-3 font-mono text-[11px] text-muted">
                    <span className="w-2">{star}</span>
                    <span className="h-px flex-1 bg-line/10">
                      <span
                        className="block h-px bg-ink transition-[width] duration-1000"
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    </span>
                    <span className="w-5 text-right">{count}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </div>

      {total > 0 ? (
        <Marquee className="[&>div]:[animation-duration:70s] hover:[&>div]:[animation-play-state:paused]">
          {reviews.slice(0, 12).map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </Marquee>
      ) : (
        <div className="container-x">
          <p className="max-w-md text-muted">
            No reviews yet. Complete a booking and be the first to share how it went.
          </p>
        </div>
      )}
    </section>
  );
}
