import React from "react";
import { Link } from "react-router-dom";
import logoImage from "../../assets/images/wheelz-logo.png"; // Update path/extension

export default function Logo({ size = "md" }) {
  const sizes = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
    xl: "h-16",
  };

  return (
    <Link to="/" className="flex items-center gap-2">
      <img
        src={logoImage}
        alt="Wheelz"
        className={`${sizes[size]} w-auto object-contain`}
      />
    </Link>
  );
}
