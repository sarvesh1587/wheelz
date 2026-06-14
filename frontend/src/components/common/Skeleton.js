/**
 * Skeleton Loader Components
 * File: frontend/src/components/common/Skeleton.js
 */

import React from "react";
import { motion } from "framer-motion";

// ─── Base Skeleton with shimmer ───────────────────────────────────────────────

export function Skeleton({
  variant = "text",
  width,
  height,
  size,
  className = "",
  style = {},
}) {
  const base = {
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.6s infinite linear",
    borderRadius: 8,
  };

  const variants = {
    text: { height: height || 14, width: width || "100%", borderRadius: 6 },
    circle: {
      width: size || 40,
      height: size || 40,
      borderRadius: "50%",
      flexShrink: 0,
    },
    card: { width: width || "100%", height: height || 120, borderRadius: 16 },
    "table-row": { width: "100%", height: 44, borderRadius: 8 },
    avatar: {
      width: size || 48,
      height: size || 48,
      borderRadius: 12,
      flexShrink: 0,
    },
    button: { width: width || 100, height: height || 36, borderRadius: 10 },
    badge: { width: width || 70, height: 22, borderRadius: 20 },
    image: { width: width || "100%", height: height || 200, borderRadius: 12 },
    sparkline: { width: width || 80, height: 28, borderRadius: 4 },
  };

  const variantStyle = variants[variant] || variants.text;

  return (
    <>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div
        className={className}
        style={{ ...base, ...variantStyle, ...style }}
      />
    </>
  );
}

// ─── Dashboard Skeleton ──────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f9fafb, #f3f4f6)",
        padding: "96px 16px 48px",
        maxWidth: 1280,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Skeleton
          variant="text"
          width={260}
          height={28}
          style={{ marginBottom: 10 }}
        />
        <Skeleton variant="text" width={180} height={14} />
      </div>
      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <Skeleton
                  variant="text"
                  width="70%"
                  height={12}
                  style={{ marginBottom: 12 }}
                />
                <Skeleton variant="text" width="50%" height={28} />
              </div>
              <Skeleton
                variant="avatar"
                size={44}
                style={{ borderRadius: 12 }}
              />
            </div>
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: 8,
        }}
      >
        {[120, 90, 80, 110, 95].map((w, i) => (
          <Skeleton
            key={i}
            variant="button"
            width={w}
            height={36}
            style={{ borderRadius: 8 }}
          />
        ))}
      </div>
      {/* Cards */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            background: "white",
            borderRadius: 16,
            padding: 20,
            marginBottom: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", gap: 16 }}>
            <Skeleton
              variant="image"
              width={96}
              height={96}
              style={{ borderRadius: 12, flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <Skeleton
                    variant="text"
                    width="55%"
                    height={16}
                    style={{ marginBottom: 8 }}
                  />
                  <Skeleton
                    variant="text"
                    width="35%"
                    height={12}
                    style={{ marginBottom: 10 }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <Skeleton variant="badge" />
                    <Skeleton variant="badge" />
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: 120 }}>
                  <Skeleton
                    variant="text"
                    width={80}
                    height={22}
                    style={{ marginBottom: 8, marginLeft: "auto" }}
                  />
                  <Skeleton
                    variant="button"
                    width={120}
                    height={30}
                    style={{ marginLeft: "auto" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <Skeleton variant="text" width="40%" height={12} />
                <Skeleton variant="text" width="30%" height={12} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
