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
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-[3px] border-amber-500/20 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-transparent border-t-amber-500 rounded-full animate-spin" />
            <div className="absolute inset-1.5 bg-[#0B1120] rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-amber-500">W</span>
            </div>
          </div>
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
