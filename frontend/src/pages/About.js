import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SplitText, Reveal, Magnetic, Eyebrow, Marquee } from "../components/motion";
import usePlatformStats, { joinCities } from "../hooks/usePlatformStats";

export default function About() {
  const platform = usePlatformStats();
  const dash = (v) => (platform.ready ? v : "—");
  // Counted from the live fleet, never rounded up.
  const stats = [
    { number: dash(platform.vehicles), label: "Vehicles listed" },
    { number: dash(platform.cities.length), label: platform.cities.length === 1 ? "City" : "Cities" },
    { number: dash(platform.reviews), label: "Verified reviews" },
    { number: platform.rating ? platform.rating.toFixed(1) : "—", label: "Average rating" },
  ];

  const values = [
    {
      title: "Trust & Transparency",
      description:
        "No hidden charges, clear pricing, and full transparency in every transaction.",
    },
    {
      title: "Customer First",
      description: "Real people answering support, and a booking flow without surprises.",
    },
    {
      title: "Quality Assurance",
      description: "All vehicles are thoroughly inspected and maintained.",
    },
    {
      title: "Innovation",
      description:
        "AI-powered search and smart recommendations for best experience.",
    },
  ];

  const milestones = [
    {
      year: "2024",
      title: "Started in Pune",
      description: "Wheelz began with a handful of verified cars and bikes and one simple booking flow.",
    },
    {
      year: "2025",
      title: "Payments and KYC",
      description: "Razorpay checkout and document-based KYC so every rental is paid and verified.",
    },
    {
      year: "2025",
      title: "Ridesharing",
      description: "Renters can offer empty seats on their trips and split the cost.",
    },
    {
      year: "2026",
      title: "AI search and trip planner",
      description: "Describe what you need in plain words; the planner picks a vehicle and estimates the cost.",
    },
  ];

  return (
    <div className="pb-24 pt-28 md:pt-36">
      {/* Hero */}
      <section className="container-x">
        <Eyebrow index="01" className="mb-8">About Wheelz</Eyebrow>
        <h1 className="display text-[15vw] leading-[0.85] md:text-[11vw]">
          <SplitText lines={["Built for", "the road."]} lineClassName="[&:last-child]:text-muted" />
        </h1>
        <div className="mt-12 grid gap-10 border-t border-line/10 pt-10 md:grid-cols-12">
          <p className="display-tight text-2xl leading-snug md:col-span-7 md:text-3xl">
            Revolutionizing mobility in India with premium car and bike rentals.
          </p>
          <div className="space-y-4 text-muted md:col-span-5">
            <p>
              Founded in 2024, Wheelz was born from a simple idea: making quality vehicle rentals accessible,
              affordable, and hassle-free for everyone in India.
            </p>
            <p>
              We started in Pune and grow city by city, only where we have vehicles you can actually book.
              {platform.cities.length > 0 && <> Today you can rent with us in {joinCities(platform.cities)}.</>}
            </p>
            <p>
              AI search helps you find the right car or bike quickly, prices are shown upfront, and every owner is
              verified before their vehicles go live.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Link to="/vehicles" className="btn-primary">
                Browse vehicles <ArrowUpRight size={16} />
              </Link>
              <Link to="/contact" className="btn-ghost">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-x mt-28 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.06} className="border-t border-line/10 pt-6">
            <p className="display text-6xl md:text-7xl">{stat.number}</p>
            <p className="eyebrow mt-3">{stat.label}</p>
          </Reveal>
        ))}
      </section>

      <Marquee className="mt-28 border-y border-line/10 py-6">
        {["Cars", "Bikes", "SUVs", "Scooters", "Rideshare", "Trip planner", "Verified owners"].map((w) => (
          <span key={w} className="display mx-8 flex items-center gap-8 text-5xl text-muted md:text-7xl">
            {w} <span className="h-3 w-3 rounded-full bg-accent" />
          </span>
        ))}
      </Marquee>

      {/* Values */}
      <section className="container-x mt-28">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow index="02" className="mb-6">Core values</Eyebrow>
            <h2 className="display text-5xl md:text-7xl">
              <SplitText inView lines={["What we", "stand for."]} />
            </h2>
          </div>
          <p className="max-w-sm text-muted">The principles that guide everything we do.</p>
        </div>
        <div className="grid border-t border-line/10 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <Reveal
              key={value.title}
              delay={index * 0.06}
              className="border-b border-line/10 py-8 md:pr-8 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0"
            >
              <span className="font-mono text-sm text-accent">({String(index + 1).padStart(2, "0")})</span>
              <h3 className="display-tight mt-6 text-2xl">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{value.description}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section className="container-x mt-28">
        <Eyebrow index="03" className="mb-6">Our journey</Eyebrow>
        <h2 className="display mb-12 text-5xl md:text-7xl">
          <SplitText inView lines={["Key milestones."]} />
        </h2>
        <ol className="border-t border-line/10">
          {milestones.map((milestone, index) => (
            <Reveal
              as="li"
              key={milestone.title}
              delay={index * 0.05}
              className="grid gap-4 border-b border-line/10 py-8 md:grid-cols-12 md:items-baseline"
            >
              <span className="display text-4xl text-accent md:col-span-2">{milestone.year}</span>
              <h3 className="display-tight text-2xl md:col-span-4">{milestone.title}</h3>
              <p className="text-muted md:col-span-6">{milestone.description}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Mission & Vision */}
      <section className="container-x mt-28 grid gap-6 md:grid-cols-2">
        {[
          [
            "Our mission",
            "To provide seamless, technology-driven mobility solutions that empower people to travel freely across India with confidence, convenience, and complete peace of mind.",
          ],
          [
            "Our vision",
            "To be the rental platform people trust in every city we operate in, by keeping quality, reliability and pricing honest.",
          ],
        ].map(([title, body], i) => (
          <Reveal key={title} delay={i * 0.08} className="rounded-[28px] border border-line/10 bg-surface p-8 md:p-12">
            <p className="eyebrow mb-8">{title}</p>
            <p className="display-tight text-2xl leading-snug md:text-3xl">{body}</p>
          </Reveal>
        ))}
      </section>

      {/* CTA */}
      <section className="container-x mt-28 border-t border-line/10 pt-16">
        <h2 className="display text-5xl md:text-8xl">
          <SplitText inView lines={["Ready to ride?"]} />
        </h2>
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-md text-muted">
            Browse the fleet, pick your dates and you're set.
          </p>
          <div className="flex flex-wrap gap-3">
            <Magnetic>
              <Link to="/vehicles" className="btn-primary">
                Browse vehicles <ArrowUpRight size={16} />
              </Link>
            </Magnetic>
            <Link to="/register" className="btn-ghost">
              Create account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
