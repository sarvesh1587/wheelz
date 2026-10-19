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
        className="fixed inset-x-0 top-0 z-50"
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
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-canvas px-5 pb-8 pt-24 md:hidden"
          >
            <ul className="space-y-1">
              {[{ to: "/", label: "Home" }, ...navItems, { to: "/vendor/register", label: "List vehicle" }].map(
                (item, i) => (
                  <li key={item.to} className="overflow-hidden">
                    <motion.button
                      initial={{ y: "100%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.15 + i * 0.05 }}
                      onClick={() => go(item.to)}
                      className={`display block text-[13vw] leading-[1.05] ${
                        isActive(item.to) ? "text-accent" : "text-ink"
                      }`}
                    >
                      {item.label}
                    </motion.button>
                  </li>
                ),
              )}
            </ul>

            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => go("/login")} className="btn-ghost">
                  Log in
                </button>
                <button onClick={() => go("/register")} className="btn-primary">
                  Get started
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between border-t border-line/10 pt-5">
                <div>
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted">{user?.email}</p>
                </div>
                <button onClick={handleLogout} className="chip">
                  Log out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
