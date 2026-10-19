import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SplitText, Reveal, Magnetic, Eyebrow, Marquee } from "../components/motion";

export default function About() {
  const stats = [
    { number: "500+", label: "Vehicles" },
    { number: "15+", label: "Cities" },
    { number: "50K+", label: "Happy Customers" },
    { number: "4.2", label: "Customer Rating" },
  ];

  const values = [
    {
      title: "Trust & Transparency",
      description:
        "No hidden charges, clear pricing, and full transparency in every transaction.",
    },
    {
      title: "Customer First",
      description: "24/7 customer support and hassle-free booking experience.",
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
      title: "Company Founded",
      description:
        "wheelz started with a vision to revolutionize vehicle rentals in India",
    },
    {
      year: "2024",
      title: "First 1000 Bookings",
      description: "Achieved 1000 successful bookings within first 3 months",
    },
    {
      year: "2025",
      title: "Expanded to 15 Cities",
      description: "Launched operations in 15 major Indian cities",
    },
    {
      year: "2026",
      title: "AI Integration",
      description: "Introduced AI-powered chatbot and smart search",
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
              What started as a small operation in Pune has now grown into a trusted platform serving thousands of
              customers across 15+ major cities. We've helped over 50,000 happy renters find their perfect ride, from
              economy cars to luxury SUVs and premium bikes.
            </p>
            <p>
              Our AI-powered platform ensures you get the best vehicle at the best price, with transparent pricing and
              24/7 customer support.
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
            "To become India's most trusted and innovative vehicle rental platform, setting new standards for quality, reliability, and customer satisfaction in the mobility space.",
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
            Join thousands of happy customers who trust us for their mobility needs.
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
