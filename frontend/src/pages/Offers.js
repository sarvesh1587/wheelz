import React from "react";
import { Link } from "react-router-dom";
import {
  GiftIcon,
  TicketIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function Offers() {
  const offers = [
    {
      title: "First Ride Discount",
      code: "WELCOME10",
      discount: "10% OFF",
      expiry: "First booking only",
    },
    {
      title: "Weekend Special",
      code: "WEEKEND20",
      discount: "20% OFF",
      expiry: "Fri-Sun bookings",
    },
    {
      title: "Long Term Rental",
      code: "LONGTERM",
      discount: "15% OFF",
      expiry: "5+ days rental",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 pt-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Special Offers
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Save big on your next ride
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((offer, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white"
          >
            <SparklesIcon className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
            <p className="text-3xl font-bold mb-2">{offer.discount}</p>
            <p className="text-sm opacity-90 mb-4">{offer.expiry}</p>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <span className="font-mono">Use Code: {offer.code}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link to="/vehicles" className="btn-primary inline-block">
          Browse Vehicles
        </Link>
      </div>
    </div>
  );
}
