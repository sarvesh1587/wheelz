import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import ReviewSection from "../components/ReviewSection";
import { vehicleAPI, aiAPI } from "../services/api";
import VehicleCard from "../components/vehicle/VehicleCard";
import AnimatedHero from "../components/home/AnimatedHero";
import { Reveal, SplitText, Magnetic, Marquee, Eyebrow, EASE } from "../components/motion";
import usePlatformStats from "../hooks/usePlatformStats";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Search in plain words",
    desc: "Type what you need — a scooter under ₹400, an SUV for the weekend. Filter by price, type and features.",
  },
  {
    step: "02",
    title: "Book and pay in seconds",
    desc: "Pick your dates, add insurance or GPS, and pay with UPI, card or netbanking through Razorpay.",
  },
  {
    step: "03",
    title: "Pick up the keys",
    desc: "Show your booking at pick-up, complete a quick KYC check and you're on the road.",
  },
];


const TABS = [
  { id: "all", label: "All" },
  { id: "car", label: "Cars" },
  { id: "bike", label: "Bikes" },
];


function SectionHeader({ index, eyebrow, lines, children }) {
  return (
    <div className="mb-12 flex flex-col gap-8 md:mb-16 md:flex-row md:items-end md:justify-between">
      <div>
        <Eyebrow index={index} className="mb-6">
          {eyebrow}
        </Eyebrow>
        <h2 className="display text-5xl md:text-7xl lg:text-8xl">
          <SplitText lines={lines} inView />
        </h2>
      </div>
      {children}
    </div>
  );
}

export default function Home() {
  const platform = usePlatformStats();
  const [featured, setFeatured] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    vehicleAPI
      .getAll({ sort: "popular", limit: 8 })
      .then((res) => setFeatured(res.data.vehicles))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));

    aiAPI
      .getRecommendations()
      .then((res) => setRecommendations(res.data.recommendations))
      .catch(() => {});
  }, []);

  const discountedVehicles = (
    activeTab === "all" ? featured : featured.filter((v) => v.category === activeTab)
  );

  return (
    <div>
      <AnimatedHero />

      {platform.cities.length > 0 && (
      <section className="border-y border-line/10 py-6 md:py-8">
        <Marquee>
          {(platform.cities.length < 4 ? [...platform.cities, ...platform.cities, ...platform.cities] : platform.cities).map((city, i) => (
            <span key={`${city}-${i}`} className="display flex items-center gap-8 pr-8 text-5xl md:text-7xl">
              {city}
              <span className="inline-block h-3 w-3 rounded-full bg-accent md:h-4 md:w-4" />
            </span>
          ))}
        </Marquee>
      </section>
      )}

      <section className="container-x py-24 md:py-36">
        <SectionHeader index="02" eyebrow="Featured fleet" lines={["This week's", "favourites."]}>
          <div className="flex flex-col items-start gap-6 md:items-end">
            <div className="relative flex rounded-full border border-line/15 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300 ${
                    activeTab === tab.id ? "text-canvas" : "text-muted hover:text-ink"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="home-tab"
                      transition={{ duration: 0.5, ease: EASE }}
                      className="absolute inset-0 -z-10 rounded-full bg-ink"
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>
            <p className="max-w-xs text-sm text-muted md:text-right">
              The most-booked rides right now, at the price you actually pay.
            </p>
          </div>
        </SectionHeader>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="shimmer aspect-[4/5] rounded-[20px]" />
                <div className="shimmer mt-4 h-5 w-2/3 rounded" />
                <div className="shimmer mt-2 h-3 w-1/3 rounded" />
              </div>
            ))}
          </div>
        ) : discountedVehicles.length ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {discountedVehicles.map((v, i) => (
              <VehicleCard key={v._id} vehicle={v} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-muted">No vehicles in this category yet.</p>
        )}

        <Reveal className="mt-16 flex justify-center">
          <Magnetic>
            <Link to="/vehicles" className="btn-ghost">
              Explore the full fleet <ArrowUpRight size={16} />
            </Link>
          </Magnetic>
        </Reveal>
      </section>

      {recommendations.length > 0 && (
        <section className="bg-surface py-24 md:py-36">
          <div className="container-x">
            <SectionHeader index="03" eyebrow="Picked for you" lines={["Made for", "your trips."]}>
              <p className="max-w-xs text-sm text-muted md:text-right">
                Suggestions based on what you've browsed and booked.
              </p>
            </SectionHeader>
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.slice(0, 6).map((v, i) => (
                <VehicleCard key={v._id} vehicle={v} index={i} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="how-it-works" className="container-x py-24 md:py-36">
        <SectionHeader index="04" eyebrow="How it works" lines={["Three steps.", "Zero paperwork."]} />
        <div className="border-t border-line/10">
          {HOW_IT_WORKS.map((item, i) => (
            <Reveal
              key={item.step}
              delay={i * 0.08}
              className="group grid gap-4 border-b border-line/10 py-8 md:grid-cols-12 md:items-baseline md:py-12"
            >
              <span className="font-mono text-sm text-accent md:col-span-2">{item.step}</span>
              <h3 className="display-tight text-3xl transition-transform duration-700 ease-out-expo group-hover:translate-x-3 md:col-span-5 md:text-5xl">
                {item.title}
              </h3>
              <p className="max-w-md text-muted md:col-span-5">{item.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x pb-24 md:pb-36">
        <Reveal className="relative overflow-hidden rounded-[28px] bg-accent px-6 py-16 text-accent-ink md:px-14 md:py-24">
          <p className="eyebrow !text-accent-ink/70 mb-8">For owners</p>
          <h2 className="display max-w-4xl text-5xl md:text-8xl">
            Your car earns while you don&apos;t.
          </h2>
          <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <p className="max-w-md text-accent-ink/80">
              List a car or bike in minutes. Verified renters, insured trips and
              weekly payouts.
            </p>
            <Magnetic>
              <Link
                to="/vendor/register"
                className="btn bg-accent-ink text-accent hover:bg-canvas hover:text-ink"
              >
                List your vehicle <ArrowUpRight size={16} />
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </section>

      <ReviewSection />
    </div>
  );
}
