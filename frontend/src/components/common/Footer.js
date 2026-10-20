import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowRight, ArrowUpRight, Mail, MapPin, Moon, Phone, Sun } from "lucide-react";
import toast from "react-hot-toast";
import { getLenis } from "../motion/SmoothScroll";
import { Reveal, Magnetic, SplitText, EASE } from "../motion";
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
    title: "Rent",
    links: [
      { label: "Cars", to: "/vehicles?category=car" },
      { label: "Bikes", to: "/vehicles?category=bike" },
      { label: "Electric", to: "/vehicles?fuelType=electric" },
      { label: "Full fleet", to: "/vehicles" },
      { label: "Offers", to: "/offers" },
    ],
  },
  {
    title: "Ride together",
    links: [
      { label: "Find a trip", to: "/find-trip" },
      { label: "Offer a trip", to: "/offer-trip" },
      { label: "AI trip planner", to: "/trip-planner" },
    ],
  },
  {
    title: "Your account",
    links: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Wishlist", to: "/wishlist" },
      { label: "My trips", to: "/my-trips" },
      { label: "KYC verification", to: "/kyc" },
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

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const theme = useTheme();
  const platform = usePlatformStats();

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setIsSubscribing(true);
    // No newsletter endpoint yet; this only confirms locally.
    setTimeout(() => {
      toast.success("Subscribed. Watch your inbox for updates.");
      setEmail("");
      setIsSubscribing(false);
    }, 800);
  };

  const scrollToTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <footer className="relative mt-auto overflow-hidden border-t border-line/10 bg-canvas text-ink">
        {/* CTA band */}
        <div className="container-x pt-20">
          <Reveal className="relative overflow-hidden rounded-[32px] bg-accent p-8 text-accent-ink md:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[40px] border-accent-ink/10"
            />
            <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] opacity-70">
                  {platform.ready
                    ? `${platform.vehicles} vehicles live in ${platform.cities.length} ${platform.cities.length === 1 ? "city" : "cities"}`
                    : "Book in minutes"}
                </p>
                <h2 className="display text-5xl md:text-7xl">
                  <SplitText inView lines={["Ready when", "you are."]} />
                </h2>
              </div>
              <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
                <Magnetic>
                  <Link
                    to="/vehicles"
                    className="btn bg-accent-ink text-accent transition-colors hover:bg-canvas hover:text-ink"
                  >
                    Browse the fleet <ArrowUpRight size={16} />
                  </Link>
                </Magnetic>
                <Link
                  to="/vendor/register"
                  className="btn border border-accent-ink/30 text-accent-ink hover:border-accent-ink hover:bg-accent-ink hover:text-accent"
                >
                  List your vehicle
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="container-x pt-20">
          <div className="grid gap-14 lg:grid-cols-12">
            {/* Brand + contact */}
            <Reveal className="lg:col-span-4">
              <Link to="/" className="display text-4xl">
                Wheelz<span className="text-accent">.</span>
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
                Cars and bikes from verified owners, ridesharing for the trips in between, and an AI planner that
                works out the cost before you go.
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                <li>
                  <a href={CONTACT.phoneHref} className="group inline-flex items-center gap-3 text-ink/80 hover:text-ink">
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-line/15 transition-colors group-hover:border-accent group-hover:text-accent">
                      <Phone size={14} />
                    </span>
                    {CONTACT.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${CONTACT.email}`} className="group inline-flex items-center gap-3 text-ink/80 hover:text-ink">
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-line/15 transition-colors group-hover:border-accent group-hover:text-accent">
                      <Mail size={14} />
                    </span>
                    {CONTACT.email}
                  </a>
                </li>
                <li className="inline-flex items-center gap-3 text-ink/80">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-line/15">
                    <MapPin size={14} />
                  </span>
                  {CONTACT.office}
                </li>
              </ul>
            </Reveal>

            {/* Link columns */}
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
              {COLUMNS.map((col, ci) => (
                <Reveal key={col.title} delay={ci * 0.06}>
                  <p className="eyebrow mb-5">{col.title}</p>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          className="group inline-flex items-center gap-1 text-sm text-ink/80 transition-colors hover:text-accent"
                        >
                          {link.label}
                          <ArrowUpRight
                            size={12}
                            className="-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Cities + newsletter */}
          <div className="mt-16 grid gap-10 border-t border-line/10 pt-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-5 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                Where we operate
              </p>
              {platform.cities.length ? (
                <div className="flex flex-wrap gap-2">
                  {platform.cities.map((city) => (
                    <Link key={city} to={`/vehicles?city=${encodeURIComponent(city)}`} className="chip hover:!border-accent hover:!text-accent">
                      <MapPin size={12} /> {city}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">Loading cities…</p>
              )}
            </div>

            <div className="lg:col-span-5">
              <p className="eyebrow mb-5">Newsletter</p>
              <form
                onSubmit={handleSubscribe}
                className="flex items-center gap-2 rounded-full border border-line/15 p-1.5 pl-5 transition-colors focus-within:border-accent"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="New cities and offers, monthly"
                  aria-label="Email address"
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted"
                />
                <button type="submit" disabled={isSubscribing} aria-label="Subscribe" className="btn-primary group !px-4 !py-2.5">
                  <ArrowRight size={16} className="transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-14 flex flex-col gap-4 border-t border-line/10 py-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Wheelz · Made in Pune, India</p>
            <p className="font-mono uppercase tracking-[0.18em]">Razorpay · UPI · Cards · Netbanking</p>
            <div className="flex items-center gap-4">
              {theme && (
                <button
                  onClick={theme.toggle}
                  className="inline-flex items-center gap-2 rounded-full border border-line/15 px-3 py-1.5 text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  {theme.dark ? <Sun size={13} /> : <Moon size={13} />}
                  {theme.dark ? "Light mode" : "Dark mode"}
                </button>
              )}
              <button onClick={scrollToTop} className="link-underline text-ink">
                Back to top
              </button>
            </div>
          </div>
        </div>

        {/* Oversized wordmark, cropped by the page edge */}
        <motion.p
          aria-hidden
          initial={{ y: "40%" }}
          whileInView={{ y: "18%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: EASE }}
          className="display pointer-events-none select-none whitespace-nowrap text-center text-[25vw] leading-[0.75] text-ink/[0.06]"
        >
          Wheelz<span className="text-accent/30">.</span>
        </motion.p>
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
