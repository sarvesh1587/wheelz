import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="text-center">
        <div className="text-9xl font-bold text-amber-500 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          🏠 Back to Home
        </Link>
      </div>
    </div>
  );
}
