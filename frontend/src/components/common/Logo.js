import React from "react";
import { Link } from "react-router-dom";

export default function Logo({ size = "md" }) {
  const sizes = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };

  return (
    <Link to="/" className="flex items-center">
      <img src="/logo.png" alt="Wheelz" className={`${sizes[size]} w-auto`} />
    </Link>
  );
}
