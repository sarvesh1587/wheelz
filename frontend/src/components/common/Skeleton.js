/**
 * Skeleton Loader Components
 * File: frontend/src/components/common/Skeleton.js
 */

import React from "react";

// ─── Base Skeleton with shimmer ───────────────────────────────────────────────

export function Skeleton({
  variant = "text",
  width,
  height,
  size,
  className = "",
  style = {},
}) {
  const variants = {
    text: { height: height || 14, width: width || "100%", borderRadius: 6 },
    circle: {
      width: size || 40,
      height: size || 40,
      borderRadius: "50%",
      flexShrink: 0,
    },
    card: { width: width || "100%", height: height || 120, borderRadius: 24 },
    "table-row": { width: "100%", height: 44, borderRadius: 8 },
    avatar: {
      width: size || 48,
      height: size || 48,
      borderRadius: 999,
      flexShrink: 0,
    },
    button: { width: width || 100, height: height || 36, borderRadius: 999 },
    badge: { width: width || 70, height: 22, borderRadius: 999 },
    image: { width: width || "100%", height: height || 200, borderRadius: 20 },
    sparkline: { width: width || 80, height: 28, borderRadius: 4 },
  };

  return (
    <div
      className={`shimmer ${className}`}
      style={{ ...(variants[variant] || variants.text), ...style }}
    />
  );
}

// ─── Dashboard Skeleton ──────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <div className="mb-16 border-b border-line/10 pb-10">
        <Skeleton width={120} height={12} />
        <Skeleton width="min(520px, 80%)" height={72} style={{ marginTop: 24, borderRadius: 12 }} />
      </div>
      <div className="mb-14 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-t border-line/10 pt-5">
            <Skeleton width={90} height={10} />
            <Skeleton width={120} height={40} style={{ marginTop: 14, borderRadius: 8 }} />
          </div>
        ))}
      </div>
      <Skeleton height={52} style={{ marginBottom: 40, borderRadius: 0 }} />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-8 border-b border-line/10 py-6">
          <Skeleton variant="image" width={128} height={96} />
          <div className="flex-1 space-y-3">
            <Skeleton width={100} height={10} />
            <Skeleton width="45%" height={22} />
            <Skeleton width="60%" height={12} />
          </div>
          <Skeleton width={110} height={32} />
        </div>
      ))}
    </div>
  );
}

// ─── Vehicle skeletons ───────────────────────────────────────────────────────
// The photo slot shows a little car outline driving along a dashed road while
// the real photo loads, so a slow network reads as "on its way", not broken.

function DrivingCar({ className = "", delay = 0, bottom = "18%" }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 h-10 overflow-hidden ${className}`} style={{ bottom }} aria-hidden>
      <div className="skeleton-road absolute inset-x-0 bottom-1 h-px" />
      <svg
        viewBox="0 0 64 28"
        className="skeleton-car absolute bottom-1.5 h-7 w-16 text-line/25"
        style={{ animationDelay: `${delay}ms` }}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 20h4m12 0h22m12 0h6v-6l-8-3-8-7H22l-8 7-8 2-2 4z" />
        <path d="M24 5l-5 6h30l-6-6z" />
        <g className="skeleton-wheel" style={{ transformOrigin: "14px 20px" }}>
          <circle cx="14" cy="20" r="5" />
          <path d="M14 15v10M9 20h10" />
        </g>
        <g className="skeleton-wheel" style={{ transformOrigin: "48px 20px" }}>
          <circle cx="48" cy="20" r="5" />
          <path d="M48 15v10M43 20h10" />
        </g>
      </svg>
    </div>
  );
}

export function VehicleCardSkeleton({ compact = false, index = 0 }) {
  return (
    <div className="skeleton-rise" style={{ animationDelay: `${(index % 4) * 80}ms` }}>
      <div
        className={`shimmer relative overflow-hidden rounded-[20px] ${compact ? "aspect-[4/3]" : "aspect-[4/5]"}`}
      >
        <Skeleton variant="badge" className="absolute left-4 top-4" style={{ background: "rgb(var(--line) / 0.08)" }} />
        <Skeleton variant="circle" size={36} className="absolute right-4 top-4" style={{ background: "rgb(var(--line) / 0.08)" }} />
        <DrivingCar delay={-(index % 4) * 700} />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton width="70%" height={18} />
          <Skeleton width="40%" height={11} />
        </div>
        <Skeleton width={64} height={22} />
      </div>
    </div>
  );
}

export function VehicleGridSkeleton({ count = 4, className = "", compact = false }) {
  return (
    <div className={className} role="status" aria-label="Loading vehicles">
      {Array.from({ length: count }, (_, i) => (
        <VehicleCardSkeleton key={i} index={i} compact={compact} />
      ))}
    </div>
  );
}

export function VehicleDetailSkeleton() {
  return (
    <div className="container-x pb-24 pt-24 md:pt-28" role="status" aria-label="Loading vehicle">
      <Skeleton width={110} height={12} style={{ marginBottom: 32 }} />
      <div className="shimmer relative aspect-[4/3] overflow-hidden rounded-[28px] md:aspect-[21/9]">
        <DrivingCar className="origin-bottom scale-150" bottom="42%" />
        <div className="absolute bottom-4 left-4 flex gap-2 md:bottom-6 md:left-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width={80} height={56} style={{ borderRadius: 12, background: "rgb(var(--line) / 0.08)" }} />
          ))}
        </div>
      </div>
      <div className="mt-12 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Skeleton width={140} height={11} />
          <Skeleton width="80%" height={64} style={{ marginTop: 20, borderRadius: 12 }} />
          <Skeleton width="45%" height={14} style={{ marginTop: 24 }} />
          <div className="mt-14 grid grid-cols-2 border-t border-line/10 sm:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="skeleton-rise border-b border-line/10 py-5 pr-4" style={{ animationDelay: `${i * 60}ms` }}>
                <Skeleton width={60} height={10} />
                <Skeleton width="70%" height={20} style={{ marginTop: 10 }} />
              </div>
            ))}
          </div>
        </div>
        <aside className="lg:col-span-5">
          <div className="rounded-[24px] border border-line/10 bg-surface p-6 md:p-8">
            <Skeleton width={70} height={10} />
            <Skeleton width={180} height={56} style={{ marginTop: 12, borderRadius: 12 }} />
            <div className="mt-8 space-y-3">
              <Skeleton height={48} style={{ borderRadius: 14 }} />
              <Skeleton height={48} style={{ borderRadius: 14 }} />
            </div>
            <Skeleton height={52} style={{ marginTop: 24, borderRadius: 999 }} />
          </div>
        </aside>
      </div>
    </div>
  );
}

// Generic page shell shown while a route's code chunk downloads.
export function PageSkeleton() {
  return (
    <div className="container-x pb-24 pt-28 md:pt-32" role="status" aria-label="Loading page">
      <Skeleton width={120} height={12} />
      <Skeleton width="min(640px, 85%)" height={72} style={{ marginTop: 24, borderRadius: 12 }} />
      <Skeleton width="min(420px, 60%)" height={16} style={{ marginTop: 20 }} />
      <VehicleGridSkeleton
        count={4}
        className="mt-16 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
      />
    </div>
  );
}

export default Skeleton;
