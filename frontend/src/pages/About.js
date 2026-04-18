import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 pt-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          About Wheelz
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Your Trusted Vehicle Rental Partner
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Our Story
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Founded in 2024, Wheelz has revolutionized the vehicle rental
            industry in India. We started with a simple mission: to make quality
            vehicle rentals accessible, affordable, and hassle-free for
            everyone.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            To provide seamless, technology-driven mobility solutions that
            empower people to travel freely across India with confidence and
            convenience.
          </p>
        </div>
      </div>
    </div>
  );
}
