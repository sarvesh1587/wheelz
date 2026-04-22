import React from "react";
import { Link } from "react-router-dom";
import {
  HeartIcon,
  CalendarIcon,
  TruckIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function EmptyState({
  type,
  title,
  message,
  actionLink,
  actionText,
}) {
  const icons = {
    wishlist: <HeartIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />,
    bookings: <CalendarIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />,
    vehicles: <TruckIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />,
    search: (
      <MagnifyingGlassIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
    ),
  };

  const defaultMessages = {
    wishlist: {
      title: "Wishlist is empty",
      message: "Save your favorite vehicles here",
      actionLink: "/vehicles",
      actionText: "Browse Vehicles",
    },
    bookings: {
      title: "No bookings yet",
      message: "You haven't made any bookings",
      actionLink: "/vehicles",
      actionText: "Book a Vehicle",
    },
    vehicles: {
      title: "No vehicles found",
      message: "Try adjusting your filters",
      actionLink: "/vehicles",
      actionText: "Clear Filters",
    },
    search: {
      title: "No results found",
      message: "Try searching with different keywords",
      actionLink: "/vehicles",
      actionText: "Browse All",
    },
  };

  const content = {
    title: title || defaultMessages[type]?.title,
    message: message || defaultMessages[type]?.message,
    actionLink: actionLink || defaultMessages[type]?.actionLink,
    actionText: actionText || defaultMessages[type]?.actionText,
  };

  return (
    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
      {icons[type] || icons.search}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {content.title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{content.message}</p>
      <Link to={content.actionLink} className="btn-primary inline-block">
        {content.actionText} →
      </Link>
    </div>
  );
}
