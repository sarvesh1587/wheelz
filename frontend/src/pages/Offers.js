import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { Reveal, Magnetic } from "../components/motion";
import { PageHeader } from "../components/ui";

export default function Offers() {
  const [copied, setCopied] = useState(null);
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

  const copy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader
        index="01"
        eyebrow="Offers"
        title={["Save on", "the next ride."]}
        lede="Apply a code at checkout. One code per booking."
      />

      <div className="border-t border-line/10">
        {offers.map((offer, index) => (
          <Reveal
            key={offer.code}
            delay={index * 0.06}
            className="group grid gap-6 border-b border-line/10 py-10 md:grid-cols-12 md:items-center"
          >
            <span className="font-mono text-sm text-accent md:col-span-1">
              ({String(index + 1).padStart(2, "0")})
            </span>
            <p className="display text-6xl md:col-span-4 md:text-7xl">{offer.discount}</p>
            <div className="md:col-span-4">
              <h3 className="display-tight text-2xl">{offer.title}</h3>
              <p className="mt-1 text-sm text-muted">{offer.expiry}</p>
            </div>
            <div className="md:col-span-3 md:text-right">
              <button
                onClick={() => copy(offer.code)}
                className="inline-flex items-center gap-3 rounded-full border border-dashed border-line/30 px-5 py-3 font-mono text-sm transition-colors hover:border-accent hover:text-accent"
                aria-label={`Copy code ${offer.code}`}
              >
                {offer.code}
                {copied === offer.code ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
              </button>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-14">
        <Magnetic>
          <Link to="/vehicles" className="btn-primary">
            Browse vehicles <ArrowUpRight size={16} />
          </Link>
        </Magnetic>
      </div>
    </div>
  );
}
