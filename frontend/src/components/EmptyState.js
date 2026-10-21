import React from "react";
import { Link } from "react-router-dom";
import { Heart, Calendar, Car, Search, ArrowUpRight } from "lucide-react";

export default function EmptyState({
  type,
  title,
  message,
  actionLink,
  actionText,
}) {
  const icons = {
    wishlist: Heart,
    bookings: Calendar,
    vehicles: Car,
    search: Search,
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

  const Icon = icons[type] || icons.search;

  return (
    <div className="border-t border-line/10 py-20">
      <Icon size={22} strokeWidth={1.5} className="mb-6 text-accent" />
      <h3 className="display-tight text-3xl md:text-5xl">{content.title}</h3>
      <p className="mt-4 max-w-md text-muted">{content.message}</p>
      <Link to={content.actionLink} className="btn-primary mt-8">
        {content.actionText} <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
