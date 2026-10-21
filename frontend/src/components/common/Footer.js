import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

const LINKS = [
  { label: "Fleet", to: "/vehicles" },
  { label: "Find a trip", to: "/find-trip" },
  { label: "Offer a trip", to: "/offer-trip" },
  { label: "AI planner", to: "/trip-planner" },
  { label: "Offers", to: "/offers" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "List your vehicle", to: "/vendor/register" },
];

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
      <footer className="mt-auto border-t border-line/10 bg-canvas text-ink">
        <div className="container-x">
          {/* Logo + links */}
          <div className="flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between">
            <Link to="/" className="display text-2xl">
              Wheelz<span className="text-accent">.</span>
            </Link>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {LINKS.map((link) => (
                <Link key={link.to} to={link.to} className="text-ink/75 transition-colors hover:text-accent">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact + cities */}
          <div className="flex flex-col gap-3 border-t border-line/10 py-5 text-sm text-muted md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 hover:text-ink">
                <Phone size={13} /> {CONTACT.phone}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 hover:text-ink">
                <Mail size={13} /> {CONTACT.email}
              </a>
              <span className="inline-flex items-center gap-2">
                <MapPin size={13} /> {CONTACT.office}
              </span>
            </div>
            {platform.cities.length > 0 && (
              <p className="flex flex-wrap items-center gap-x-1.5 text-xs">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-accent" />
                Live in{" "}
                {platform.cities.map((city, i) => (
                  <React.Fragment key={city}>
                    <Link to={`/vehicles?city=${encodeURIComponent(city)}`} className="hover:text-accent">
                      {city}
                    </Link>
                    {i < platform.cities.length - 1 && <span aria-hidden>·</span>}
                  </React.Fragment>
                ))}
              </p>
            )}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col gap-3 border-t border-line/10 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Wheelz · Made in Pune, India</p>
            <div className="flex items-center gap-4">
              {theme && (
                <button onClick={theme.toggle} className="inline-flex items-center gap-1.5 hover:text-ink">
                  {theme.dark ? <Sun size={12} /> : <Moon size={12} />}
                  {theme.dark ? "Light mode" : "Dark mode"}
                </button>
              )}
              <button onClick={scrollToTop} className="hover:text-ink">
                Back to top
              </button>
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
