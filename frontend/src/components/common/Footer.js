import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { getLenis } from "../motion/SmoothScroll";
import { Reveal } from "../motion";

const COLUMNS = [
  {
    title: "Rent",
    links: [
      { label: "Cars", to: "/vehicles?category=car" },
      { label: "Bikes", to: "/vehicles?category=bike" },
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
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "List your vehicle", to: "/vendor/register" },
      { label: "Support", href: "mailto:support@wheelz.com" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

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
      <footer className="relative mt-auto overflow-hidden border-t border-line/10 bg-canvas pt-20 text-ink">
        <div className="container-x">
          <div className="grid gap-14 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow mb-6">Newsletter</p>
              <h3 className="display-tight max-w-md text-3xl md:text-4xl">
                Weekend drops, new cities and member-only rates.
              </h3>
              <form
                onSubmit={handleSubscribe}
                className="mt-8 flex max-w-md items-center border-b border-line/20 focus-within:border-ink"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  aria-label="Email address"
                  className="flex-1 bg-transparent py-4 text-base outline-none placeholder:text-muted"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  aria-label="Subscribe"
                  className="group grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-ink transition-transform disabled:opacity-60"
                >
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5"
                  />
                </button>
              </form>
            </Reveal>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
              {COLUMNS.map((col, ci) => (
                <Reveal key={col.title} delay={ci * 0.08}>
                  <p className="eyebrow mb-5">{col.title}</p>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        {link.href ? (
                          <a href={link.href} className="link-underline text-sm text-ink/80 hover:text-ink">
                            {link.label}
                          </a>
                        ) : (
                          <Link to={link.to} className="link-underline text-sm text-ink/80 hover:text-ink">
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-20 flex flex-col gap-4 border-t border-line/10 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Wheelz. Made in India.</p>
            <p className="font-mono uppercase tracking-[0.18em]">
              Razorpay · UPI · Cards · Netbanking
            </p>
            <button onClick={scrollToTop} className="link-underline self-start text-ink sm:self-auto">
              Back to top
            </button>
          </div>
        </div>

        {/* Oversized wordmark, cropped by the page edge */}
        <motion.p
          aria-hidden
          initial={{ y: "40%" }}
          whileInView={{ y: "18%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="display pointer-events-none select-none whitespace-nowrap text-center text-[25vw] leading-[0.75] text-ink/[0.06]"
        >
          Wheelz
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
            className="fixed bottom-6 left-6 z-40 grid h-12 w-12 place-items-center rounded-full border border-line/15 bg-canvas/80 text-ink backdrop-blur-md transition-colors hover:bg-ink hover:text-canvas"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
