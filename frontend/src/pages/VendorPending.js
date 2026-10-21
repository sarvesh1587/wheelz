import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SplitText, Magnetic } from "../components/motion";

const STEPS = [
  "Admin will review your documents",
  "You'll receive approval email",
  "Start adding your vehicles",
  "Vehicles will be listed after admin approval",
];

export default function VendorPending() {
  return (
    <div className="container-x flex min-h-screen flex-col justify-center pb-16 pt-28">
      <p className="eyebrow mb-6 flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-accent" /> Application submitted
      </p>
      <h1 className="display text-6xl md:text-8xl lg:text-9xl">
        <SplitText lines={["Under", "review."]} lineClassName="[&:last-child]:text-muted" />
      </h1>
      <p className="mt-8 max-w-lg text-muted">
        Thank you for registering as a vendor. Our team will review your application within 24-48 hours.
      </p>

      <ol className="mt-12 grid border-t border-line/10 md:grid-cols-4">
        {STEPS.map((step, i) => (
          <li key={step} className="border-b border-line/10 py-6 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
            <span className="font-mono text-sm text-accent">({String(i + 1).padStart(2, "0")})</span>
            <p className="mt-3 text-sm">{step}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12">
        <Magnetic>
          <Link to="/" className="btn-primary">
            Back to home <ArrowUpRight size={16} />
          </Link>
        </Magnetic>
      </div>
    </div>
  );
}
