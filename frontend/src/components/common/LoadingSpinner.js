/**
 * Loading Spinner - Fallback & Quick Load Component
 * File: frontend/src/components/common/LoadingSpinner.js
 */

import React from "react";

export default function LoadingSpinner({ fullScreen = true }) {
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          {/* Animated Wheel Logo */}
          <img
            src="/logo.png"
            alt="Wheelz"
            className="h-16 w-auto mx-auto mb-4"
          />
          <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-[3px] border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
