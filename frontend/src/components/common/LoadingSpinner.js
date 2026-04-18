import React from "react";
import { Link } from "react-router-dom";

// Loading Spinner Component
export default function LoadingSpinner({ fullScreen = true }) {
  if (fullScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">
          Loading...
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Footer Component - No spinning!
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-gray-900 text-lg">
                W
              </div>
              <span className="font-bold text-xl text-white">Wheelz</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Premium car and bike rentals across India. Travel smarter, arrive
              in style.
            </p>
            <div className="flex gap-3 mt-4">
              <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs hover:bg-amber-500 hover:text-gray-900 cursor-pointer transition-colors">
                F
              </span>
              <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs hover:bg-amber-500 hover:text-gray-900 cursor-pointer transition-colors">
                T
              </span>
              <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs hover:bg-amber-500 hover:text-gray-900 cursor-pointer transition-colors">
                I
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/vehicles?category=car"
                  className="hover:text-amber-400 transition-colors"
                >
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link
                  to="/vehicles?category=bike"
                  className="hover:text-amber-400 transition-colors"
                >
                  Browse Bikes
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="hover:text-amber-400 cursor-pointer transition-colors">
                  24/7 Support
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer transition-colors">
                  Cancellation Policy
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer transition-colors">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} Wheelz. All rights reserved.
          </p>
          <p className="text-sm flex items-center gap-1.5">
            Powered by{" "}
            <span className="text-amber-400 font-medium">Claude AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

// Star Rating Component
export function StarRating({ rating, count, size = "sm" }) {
  const stars = [1, 2, 3, 4, 5];
  const sizeClass = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {stars.map((s) => (
          <svg
            key={s}
            className={`${sizeClass} ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
}
