import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FlutedGlass } from "@paper-design/shaders-react";
import { ArrowUp, Mail, MapPin, Moon, Phone, Sun } from "lucide-react";
import { getLenis } from "../motion/SmoothScroll";
import { useTheme } from "../../context/ThemeContext";
import usePlatformStats from "../../hooks/usePlatformStats";

// Same details as the Contact page.
const CONTACT = {
  phone: "+91 6307800255",
  phoneHref: "tel:+916307800255",
  email: "hm2300439@gmail.com",
  office: "Ajmera, Pune",
};

const COLUMNS = [
  {
    title: "Ride",
    links: [
      { label: "Fleet", to: "/vehicles" },
      { label: "Find a trip", to: "/find-trip" },
      { label: "Offer a trip", to: "/offer-trip" },
      { label: "AI planner", to: "/trip-planner" },
      { label: "Offers", to: "/offers" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "List your vehicle", to: "/vendor/register" },
    ],
  },
];

const linkClass =
  "text-accent-ink/70 transition-colors hover:text-accent-ink focus-visible:outline-accent-ink";

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const theme = useTheme();
  const platform = usePlatformStats();

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <footer className="relative mt-auto overflow-hidden bg-canvas text-ink">
        {/* Oversized outlined wordmark, tucked behind the top edge of the panel */}
        <div className="pointer-events-none relative z-0 flex justify-center pt-6 md:pt-12" aria-hidden>
          <span className="display -mb-[0.12em] select-none whitespace-nowrap text-[20vw] leading-[0.75] text-transparent [-webkit-text-stroke:1px_rgb(var(--ink)/0.3)] md:text-[18vw]">
            Wheelz
          </span>
        </div>

        {/* Amber fluted-glass panel */}
        <div className="relative z-10 bg-accent text-accent-ink">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <FlutedGlass
              size={0.89}
              shape="lines"
              angle={0}
              distortionShape="prism"
              distortion={0.5}
              shift={0}
              blur={0}
              edges={0.25}
              stretch={0}
              scale={1.11}
              fit="cover"
              highlights={0.1}
              shadows={0.2}
              grainMixer={0.1}
              grainOverlay={0.1}
              colorBack="#00000000"
              colorHighlight="#FFFFFF"
              colorShadow="#000000"
              className="h-full w-full"
            />
          </div>

          <div className="container-x relative py-14 md:py-20">
            <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
              {/* Brand + contact */}
              <div className="flex max-w-sm flex-col gap-8">
                <div>
                  <Link to="/" className="display text-3xl focus-visible:outline-accent-ink">
                    Wheelz<span className="text-accent-ink/50">.</span>
                  </Link>
                  <p className="mt-3 text-xl font-medium leading-tight md:text-[22px]">
                    Rent a car, or share the ride.
                  </p>
                </div>

                <div className="flex flex-col gap-2 text-sm">
                  <a href={CONTACT.phoneHref} className={`inline-flex items-center gap-2 ${linkClass}`}>
                    <Phone size={14} /> {CONTACT.phone}
                  </a>
                  <a href={`mailto:${CONTACT.email}`} className={`inline-flex items-center gap-2 ${linkClass}`}>
                    <Mail size={14} /> {CONTACT.email}
                  </a>
                  <span className="inline-flex items-center gap-2 text-accent-ink/70">
                    <MapPin size={14} /> {CONTACT.office}
                  </span>
                </div>
              </div>

              {/* Link columns */}
              <div className="flex flex-wrap gap-12 md:gap-20">
                {COLUMNS.map((col) => (
                  <nav key={col.title} aria-label={col.title} className="flex flex-col gap-4">
                    <h3 className="text-lg font-semibold">{col.title}</h3>
                    <ul className="flex flex-col gap-3 text-[15px] font-medium">
                      {col.links.map((link) => (
                        <li key={link.to}>
                          <Link to={link.to} className={linkClass}>
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ))}

                {platform.cities.length > 0 && (
                  <nav aria-label="Cities" className="flex flex-col gap-4">
                    <h3 className="text-lg font-semibold">Live in</h3>
                    <ul className="flex flex-col gap-3 text-[15px] font-medium">
                      {platform.cities.map((city) => (
                        <li key={city}>
                          <Link to={`/vehicles?city=${encodeURIComponent(city)}`} className={linkClass}>
                            {city}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-14 flex flex-col gap-3 pb-16 sm:pb-0 border-t border-accent-ink/15 pt-5 text-xs text-accent-ink/70 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} Wheelz · Made in Pune, India</p>
              <div className="flex items-center gap-4">
                {theme && (
                  <button onClick={theme.toggle} className={`inline-flex items-center gap-1.5 ${linkClass}`}>
                    {theme.dark ? <Sun size={12} /> : <Moon size={12} />}
                    {theme.dark ? "Light mode" : "Dark mode"}
                  </button>
                )}
                <button onClick={scrollToTop} className={linkClass}>
                  Back to top
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={scrollToTop}
            aria-label="Back to top"
            className="fixed bottom-6 left-6 z-40 grid h-12 w-12 place-items-center rounded-full border border-line/15 bg-canvas/80 text-ink backdrop-blur-md transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
