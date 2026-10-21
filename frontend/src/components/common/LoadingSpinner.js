/**
 * Loading Spinner - Fallback & Quick Load Component
 * File: frontend/src/components/common/LoadingSpinner.js
 */

import React from "react";

export default function LoadingSpinner({ fullScreen = true }) {
  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex items-center gap-3 text-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="eyebrow">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}
