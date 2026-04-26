import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HeartIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  TruckIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileOpen(false);
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/vehicles") return location.pathname === "/vehicles";
    if (path === "/vehicles?category=car")
      return (
        location.pathname === "/vehicles" && location.search === "?category=car"
      );
    if (path === "/vehicles?category=bike")
      return (
        location.pathname === "/vehicles" &&
        location.search === "?category=bike"
      );
    if (path === "/admin") return location.pathname === "/admin";
    if (path === "/admin/vehicles")
      return location.pathname === "/admin/vehicles";
    if (path === "/admin/vendors")
      return location.pathname === "/admin/vendors";
    if (path === "/vendor/dashboard")
      return location.pathname === "/vendor/dashboard";
    if (path === "/vendor/vehicles")
      return location.pathname === "/vendor/vehicles";
    if (path === "/vendor/bookings")
      return location.pathname === "/vendor/bookings";
    return location.pathname === path;
  };

  // ✅ CUSTOMER NAVBAR
  const customerNavLinks = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/vehicles?category=car", label: "Cars", icon: TruckIcon },
    { to: "/vehicles?category=bike", label: "Bikes", icon: TruckIcon },
    { to: "/vehicles", label: "All Vehicles", icon: TruckIcon },
  ];

  // ✅ ADMIN NAVBAR
  const adminNavLinks = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/admin", label: "Dashboard", icon: ChartBarIcon },
    { to: "/admin/vehicles", label: "Manage Vehicles", icon: TruckIcon },
    {
      to: "/admin/vendors",
      label: "Manage Vendors",
      icon: BuildingStorefrontIcon,
    },
  ];

  // ✅ VENDOR NAVBAR
  const vendorNavLinks = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/vendor/dashboard", label: "Dashboard", icon: ChartBarIcon },
    { to: "/vendor/vehicles", label: "My Vehicles", icon: TruckIcon },
    { to: "/vendor/bookings", label: "Bookings", icon: CalendarDaysIcon },
  ];

  // ✅ Choose navbar based on role
  let navLinks = customerNavLinks;
  if (isAdmin) {
    navLinks = adminNavLinks;
  } else if (user?.role === "vendor") {
    navLinks = vendorNavLinks;
  } else if (isAuthenticated) {
    navLinks = customerNavLinks;
  }

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false);
    setProfileOpen(false);
  };

  // Animation variants
  const navVariants = {
    hidden: { y: -100 },
    visible: {
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 20 } },
    exit: { opacity: 0, x: "100%", transition: { duration: 0.3 } },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 15 },
    },
    exit: { opacity: 0, scale: 0.95, y: -10 },
  };

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border-b border-white/20 dark:border-gray-700/30"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 transition-all duration-300">
          {/* Animated Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Link
              to="/"
              className="flex items-center gap-2 group"
              onClick={() => window.scrollTo(0, 0)}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center font-bold text-gray-900 text-lg shadow-lg shadow-amber-500/25"
              >
                <span className="group-hover:scale-110 transition-transform">
                  W
                </span>
              </motion.div>
              <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent hidden sm:inline">
                Wheelz
              </span>
              <SparklesIcon className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link, idx) => (
              <motion.button
                key={link.to}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleNavigation(link.to)}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 overflow-hidden group ${
                  isActive(link.to)
                    ? "text-amber-500"
                    : "text-gray-600 dark:text-gray-300 hover:text-amber-500"
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="relative z-10">{link.label}</span>

                {/* Animated underline */}
                <span
                  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 group-hover:w-full ${
                    isActive(link.to) ? "w-full" : "w-0"
                  }`}
                />

                {/* Active indicator glow */}
                {isActive(link.to) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-amber-500/10 rounded-xl -z-0"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Animated Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggle}
              className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 overflow-hidden"
            >
              <motion.div
                initial={false}
                animate={{ rotate: dark ? 0 : 180 }}
                transition={{ duration: 0.5 }}
              >
                {dark ? (
                  <SunIcon className="w-5 h-5 text-amber-400" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-gray-600" />
                )}
              </motion.div>
            </motion.button>

            {/* List Vehicle / My Vehicles Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {user?.role === "vendor" && user?.isVendorApproved ? (
                <button
                  onClick={() => handleNavigation("/vendor/vehicles")}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <BuildingStorefrontIcon className="w-4 h-4" />
                  My Vehicles
                </button>
              ) : (
                <button
                  onClick={() => handleNavigation("/vendor/register")}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <BuildingStorefrontIcon className="w-4 h-4" />
                  List Vehicle
                </button>
              )}
            </motion.div>

            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-sm font-bold text-gray-900 shadow-md"
                  >
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </motion.div>
                  <span className="text-sm font-medium hidden lg:block">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {profileOpen && user && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 top-full mt-2 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {isAdmin && (
                            <span className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-0.5 rounded-full">
                              Admin
                            </span>
                          )}
                          {user?.role === "vendor" && (
                            <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-0.5 rounded-full">
                              Vendor
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="py-1">
                        {[
                          {
                            icon: CalendarDaysIcon,
                            label: "My Bookings",
                            path: "/dashboard",
                          },
                          {
                            icon: HeartIcon,
                            label: "Wishlist",
                            path: "/wishlist",
                          },
                          {
                            icon: UserCircleIcon,
                            label: "Profile",
                            path: "/profile",
                          },
                        ].map((item) => (
                          <motion.button
                            key={item.path}
                            whileHover={{ x: 5 }}
                            onClick={() => handleNavigation(item.path)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </motion.button>
                        ))}
                        {isAdmin && (
                          <motion.button
                            whileHover={{ x: 5 }}
                            onClick={() => handleNavigation("/admin")}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                          >
                            <ChartBarIcon className="w-4 h-4" />
                            Admin Panel
                          </motion.button>
                        )}
                        {user?.role === "vendor" && (
                          <motion.button
                            whileHover={{ x: 5 }}
                            onClick={() =>
                              handleNavigation("/vendor/dashboard")
                            }
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                          >
                            <ChartBarIcon className="w-4 h-4" />
                            Vendor Dashboard
                          </motion.button>
                        )}
                      </div>
                      <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                        <motion.button
                          whileHover={{ x: 5 }}
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          Logout
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation("/login")}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-amber-500 transition-colors"
                >
                  Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation("/register")}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-semibold text-sm rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all"
                >
                  Sign Up
                </motion.button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 md:hidden rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {menuOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Animated Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden -z-10"
              />

              <motion.div
                variants={mobileMenuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="md:hidden absolute left-0 right-0 top-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 shadow-2xl"
              >
                <div className="py-4 max-h-[80vh] overflow-y-auto">
                  {navLinks.map((link, idx) => (
                    <motion.button
                      key={link.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleNavigation(link.to)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all ${
                        isActive(link.to)
                          ? "bg-amber-500/10 text-amber-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </motion.button>
                  ))}

                  {/* Mobile: List Vehicle / My Vehicles Button */}
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => {
                      if (user?.role === "vendor" && user?.isVendorApproved) {
                        handleNavigation("/vendor/vehicles");
                      } else {
                        handleNavigation("/vendor/register");
                      }
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-green-600 border-t border-gray-100 dark:border-gray-800 mt-2 pt-3"
                  >
                    <BuildingStorefrontIcon className="w-5 h-5" />
                    {user?.role === "vendor" && user?.isVendorApproved
                      ? "My Vehicles"
                      : "List Vehicle"}
                  </motion.button>

                  {!isAuthenticated && (
                    <div className="flex gap-2 px-4 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        onClick={() => handleNavigation("/login")}
                        className="flex-1 text-center py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                      >
                        Login
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        onClick={() => handleNavigation("/register")}
                        className="flex-1 text-center py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-semibold rounded-xl shadow-md"
                      >
                        Sign Up
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
