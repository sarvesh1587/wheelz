import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { SplitText, Magnetic, EASE } from "../motion";
import { aiAPI } from "../../services/api";
import SpinGarage from "./SpinGarage";
import usePlatformStats from "../../hooks/usePlatformStats";

const BASE_TAGS = [
  { label: "Cars", type: "category", query: "car" },
  { label: "Bikes", type: "category", query: "bike" },
  { label: "Electric", type: "fuelType", query: "electric" },
];

export default function AnimatedHero() {
  const navigate = useNavigate();
  const [nlQuery, setNlQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const platform = usePlatformStats();

  // Only real numbers: counted from the live fleet.
  const STATS = [
    { value: platform.ready ? platform.vehicles : "—", label: "Vehicles" },
    { value: platform.ready ? platform.cities.length : "—", label: platform.cities.length === 1 ? "City" : "Cities" },
    { value: platform.ready ? platform.cars : "—", label: "Cars" },
    { value: platform.ready ? platform.bikes : "—", label: "Bikes" },
  ];
  const QUICK_TAGS = [
    ...BASE_TAGS,
    ...platform.cities.slice(0, 4).map((c) => ({ label: c, type: "city", query: c })),
  ];


  const handleSmartSearch = async (e) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setSearching(true);
    try {
      const { data } = await aiAPI.smartSearch(nlQuery);
      const params = data.extractedParams;
      const qs = new URLSearchParams();
      if (params?.category) qs.set("category", params.category);
      if (params?.maxPrice) qs.set("maxPrice", params.maxPrice);
      if (params?.city) qs.set("city", params.city);
      if (params?.fuelType) qs.set("fuelType", params.fuelType);
      if (nlQuery) qs.set("search", nlQuery);
      navigate(`/vehicles?${qs.toString()}`);
    } catch {
      navigate(`/vehicles?search=${encodeURIComponent(nlQuery)}`);
    } finally {
      setSearching(false);
    }
  };

  const handleTagClick = (tag) => {
    if (tag.type === "category") navigate(`/vehicles?category=${tag.query}`);
    else if (tag.type === "fuelType") navigate(`/vehicles?fuelType=${tag.query}`);
    else navigate(`/vehicles?city=${tag.query}`);
  };

  return (
    <section className="relative pb-6 pt-28 md:pt-36">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-8 flex items-center justify-between md:mb-12"
        >
          <p className="eyebrow flex items-center gap-3">
            <span className="text-accent">(01)</span> Car &amp; bike rental
          </p>
          <p className="eyebrow flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {platform.ready
              ? `Live in ${platform.cities.length} ${platform.cities.length === 1 ? "city" : "cities"}`
              : "Live now"}
          </p>
        </motion.div>

        <h1 className="display text-[15vw] md:text-[10.5vw] xl:text-[9.5vw]">
          <SplitText
            lines={["Rent the ride", "that fits the road."]}
            delay={0.25}
            lineClassName="[&:last-child]:text-muted"
          />
        </h1>

        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.7 }}
            className="lg:col-span-6"
          >
            <p className="mb-6 max-w-md text-base leading-relaxed text-muted md:text-lg">
              Cars and bikes from verified owners. Tell us what you need in plain
              words and we&apos;ll find it.
            </p>

            <form
              onSubmit={handleSmartSearch}
              className="group flex items-center gap-2 rounded-full border border-line/15 bg-surface/60 p-1.5 pl-5 backdrop-blur transition-colors focus-within:border-ink"
            >
              <Sparkles size={18} className="shrink-0 text-accent" />
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder="A bike under ₹500 in Bangalore this weekend"
                aria-label="Describe the vehicle you need"
                className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted md:text-base"
              />
              <Magnetic strength={0.2}>
                <button type="submit" disabled={searching} className="btn-primary">
                  {searching ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">Search</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </Magnetic>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => (
                <button key={tag.label} onClick={() => handleTagClick(tag)} className="chip">
                  {tag.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.dl
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.9 } } }}
            className="grid grid-cols-4 border-t border-line/10 lg:col-span-5 lg:col-start-8"
          >
            {STATS.map((s) => (
              <motion.div
                key={s.label}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
                }}
                className="border-r border-line/10 pt-4 last:border-r-0 [&:not(:first-child)]:pl-4"
              >
                <dd className="display-tight text-3xl md:text-4xl">{s.value}</dd>
                <dt className="eyebrow mt-1">{s.label}</dt>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </div>

      <SpinGarage />
    </section>
  );
}
