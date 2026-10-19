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

export default Skeleton;
