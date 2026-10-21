import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  ArrowUpRight,
  LayoutDashboard,
  Heart,
  ShieldCheck,
  Users,
  Sparkles,
  LogOut,
  Repeat,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { EASE, Magnetic } from "../motion";

const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/vehicles", label: "Vehicles" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/vendors", label: "Vendors" },
  { to: "/admin/reports", label: "Reports" },
];

const USER_NAV = [
  { to: "/vehicles", label: "Fleet" },
  { to: "/find-trip", label: "Find a trip" },
  { to: "/offer-trip", label: "Offer a trip" },
  { to: "/trip-planner", label: "AI Planner" },
];

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();

  const adminMode = location.pathname.startsWith("/admin");
  const navItems = isAdmin && adminMode ? ADMIN_NAV : USER_NAV;

  // Solid bar once scrolled; tucks away while scrolling down, returns on scroll up.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 240 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const go = (to) => {
    navigate(to);
    setProfileOpen(false);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    go("/");
  };

  const isActive = (to) =>
    location.pathname === to ||
    (to !== "/" && to !== "/admin" && location.pathname.startsWith(to));

  const profileItems = [
    ...(isAdmin
      ? [
          {
            label: adminMode ? "Switch to user view" : "Switch to admin view",
            icon: Repeat,
            to: adminMode ? "/dashboard" : "/admin",
          },
        ]
      : []),
    ...(!isAdmin || !adminMode
      ? [
          { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
          { label: "Wishlist", icon: Heart, to: "/wishlist" },
          { label: "KYC", icon: ShieldCheck, to: "/kyc" },
          { label: "Trip requests", icon: Users, to: "/trip-requests" },
        ]
      : []),
    { label: "AI Trip Planner", icon: Sparkles, to: "/trip-planner" },
  ];

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden && !menuOpen ? "-110%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed inset-x-0 top-0 z-[65]"
      >
        <div
          className={`transition-colors duration-500 ${
            scrolled || menuOpen
              ? "border-b border-line/10 bg-canvas/80 backdrop-blur-xl"
              : "border-b border-transparent"
          }`}
        >
          <nav className="container-x flex h-16 items-center justify-between md:h-20">
            <Link
              to={isAdmin && adminMode ? "/admin" : "/"}
              className="display-tight relative z-10 flex items-baseline gap-2 text-xl md:text-2xl"
              aria-label="Wheelz home"
            >
              Wheelz<span className="text-accent">.</span>
              {isAdmin && adminMode && (
                <span className="eyebrow !text-accent">Admin</span>
              )}
            </Link>

            <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={isActive(item.to) ? "page" : undefined}
                    className={`link-underline text-sm font-medium transition-colors ${
                      isActive(item.to) ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="relative z-10 flex items-center gap-2 md:gap-3">
              <button
                onClick={toggle}
                aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
                className="grid h-10 w-10 place-items-center rounded-full border border-line/10 text-ink/80 transition-colors hover:border-ink hover:text-ink"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={dark ? "sun" : "moon"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {dark ? <Sun size={16} /> : <Moon size={16} />}
                  </motion.span>
                </AnimatePresence>
              </button>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    aria-expanded={profileOpen}
                    aria-label="Account menu"
                    className="grid h-10 w-10 place-items-center rounded-full bg-ink font-display text-sm font-bold text-canvas"
                  >
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className="absolute right-0 top-full mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border border-line/10 bg-surface p-1.5 shadow-2xl shadow-black/30"
                      >
                        <div className="px-3.5 py-3">
                          <p className="truncate text-sm font-semibold">{user?.name}</p>
                          <p className="truncate text-xs text-muted">{user?.email}</p>
                        </div>
                        <div className="h-px bg-line/10" />
                        {profileItems.map(({ label, icon: Icon, to }) => (
                          <button
                            key={label}
                            onClick={() => go(to)}
                            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-ink/80 transition-colors hover:bg-raised hover:text-ink"
                          >
                            <Icon size={16} strokeWidth={1.75} />
                            {label}
                          </button>
                        ))}
                        <div className="my-1 h-px bg-line/10" />
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10"
                        >
                          <LogOut size={16} strokeWidth={1.75} />
                          Log out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden items-center gap-5 md:flex">
                  <Link to="/login" className="link-underline text-sm font-medium">
                    Log in
                  </Link>
                  <Magnetic>
                    <Link to="/register" className="btn-primary !py-2.5">
                      Get started
                      <ArrowUpRight size={16} />
                    </Link>
                  </Magnetic>
                </div>
              )}

              {!adminMode && (
                <Link
                  to="/vendor/register"
                  className="hidden text-sm font-medium text-muted transition-colors hover:text-ink lg:inline"
                >
                  List your vehicle
                </Link>
              )}

              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="grid h-10 w-10 place-items-center rounded-full border border-line/10 md:hidden"
              >
                <span className="relative block h-2.5 w-4">
                  <span
                    className={`absolute left-0 h-px w-4 bg-ink transition-transform duration-500 ease-out-expo ${
                      menuOpen ? "top-1/2 rotate-45" : "top-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 h-px w-4 bg-ink transition-transform duration-500 ease-out-expo ${
                      menuOpen ? "top-1/2 -rotate-45" : "bottom-0"
                    }`}
                  />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            // Circular reveal that grows out of the burger button (top right).
            initial={{ clipPath: "circle(0px at calc(100% - 40px) 32px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 40px) 32px)" }}
            exit={{
              clipPath: "circle(0px at calc(100% - 40px) 32px)",
              transition: { duration: 0.55, ease: [0.7, 0, 0.84, 0], delay: 0.15 },
            }}
            transition={{ duration: 0.9, ease: EASE }}
            className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-canvas px-5 pb-8 pt-24 md:hidden"
          >
            {/* Amber glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-accent/25 blur-[90px]"
            />

            {/* Oversized wordmark rising from the bottom edge */}
            <motion.p
              aria-hidden
              className="display pointer-events-none absolute -bottom-[0.18em] left-0 right-0 select-none whitespace-nowrap text-center text-[34vw] leading-none text-ink/[0.05]"
              initial={{ y: "60%" }}
              animate={{ y: "0%" }}
              exit={{ y: "60%", transition: { duration: 0.4 } }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.25 }}
            >
              Wheelz<span className="text-accent/40">.</span>
            </motion.p>

            <motion.div
              className="relative flex items-center justify-between"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            >
              <span className="eyebrow">Menu</span>
              <span className="eyebrow">Car &amp; bike rental</span>
            </motion.div>

            <motion.ul
              className="relative mt-4"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{
                show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } },
                exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
              }}
            >
              {[{ to: "/", label: "Home" }, ...navItems, { to: "/vendor/register", label: "List vehicle" }].map(
                (item, i) => {
                  const active = isActive(item.to);
                  return (
                    <motion.li key={item.to} className="relative">
                      {/* Hairline that draws in left to right */}
                      <motion.span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-px origin-left bg-line/10"
                        variants={{
                          hidden: { scaleX: 0 },
                          show: { scaleX: 1, transition: { duration: 0.9, ease: EASE } },
                          exit: { scaleX: 0, transition: { duration: 0.3 } },
                        }}
                      />
                      <motion.button
                        onClick={() => go(item.to)}
                        whileTap={{ scale: 0.97 }}
                        className="group flex w-full items-center gap-4 overflow-hidden py-3.5 text-left"
                      >
                        <motion.span
                          className={`w-7 shrink-0 font-mono text-[11px] ${active ? "text-accent" : "text-muted"}`}
                          variants={{
                            hidden: { opacity: 0, x: -10 },
                            show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
                            exit: { opacity: 0, transition: { duration: 0.2 } },
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </motion.span>
                        <span className="block overflow-hidden">
                          <motion.span
                            className={`display block text-[8vw] leading-[1.15] transition-colors duration-300 ${
                              active ? "text-accent" : "text-ink group-hover:text-accent group-active:text-accent"
                            }`}
                            variants={{
                              hidden: { y: "110%", rotate: 4 },
                              show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: EASE } },
                              exit: { y: "-110%", transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0] } },
                            }}
                          >
                            {item.label}
                          </motion.span>
                        </span>
                        <motion.span
                          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line/15 text-ink transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-ink group-active:bg-accent group-active:text-accent-ink"
                          variants={{
                            hidden: { opacity: 0, scale: 0.5, rotate: -45 },
                            show: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.6, ease: EASE } },
                            exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
                          }}
                        >
                          {active ? (
                            <span className="relative flex h-2 w-2">
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                            </span>
                          ) : (
                            <ArrowUpRight
                              size={15}
                              className="transition-transform duration-300 group-hover:rotate-45"
                            />
                          )}
                        </motion.span>
                      </motion.button>
                    </motion.li>
                  );
                },
              )}
            </motion.ul>

            <motion.div
              className="relative mt-auto pt-8"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12, transition: { duration: 0.2 } }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}
            >
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => go("/login")} className="btn-ghost bg-canvas/60 backdrop-blur-md">
                    Log in
                  </button>
                  <button onClick={() => go("/register")} className="btn-primary">
                    Get started <ArrowUpRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 rounded-[24px] border border-line/10 bg-surface/70 p-3 pl-4 backdrop-blur-xl">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent font-display text-sm font-bold text-accent-ink">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user?.name}</p>
                      <p className="truncate text-xs text-muted">{user?.email}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="chip shrink-0">
                    Log out
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
