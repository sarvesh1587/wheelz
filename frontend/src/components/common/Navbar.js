import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  InformationCircleIcon,
  PhoneIcon,
  GiftIcon,
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
  };

  // Check if a link is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    if (path.includes("category=car")) {
      return (
        location.pathname === "/vehicles" && location.search === "?category=car"
      );
    }
    if (path.includes("category=bike")) {
      return (
        location.pathname === "/vehicles" &&
        location.search === "?category=bike"
      );
    }
    if (path === "/vehicles") {
      return location.pathname === "/vehicles" && !location.search;
    }
    return location.pathname === path;
  };

  // Navigation links for all users
  const mainNavLinks = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/vehicles?category=car", label: "Cars", icon: TruckIcon },
    { to: "/vehicles?category=bike", label: "Bikes", icon: TruckIcon },
    { to: "/vehicles", label: "All Vehicles", icon: TruckIcon },
    { to: "/about", label: "About Us", icon: InformationCircleIcon },
    { to: "/contact", label: "Contact", icon: PhoneIcon },
  ];

  // Admin specific links
  const adminLinks = [
    { to: "/admin", label: "Dashboard", icon: ChartBarIcon },
    { to: "/admin/vehicles", label: "Manage Vehicles", icon: TruckIcon },
  ];

  // Customer specific links
  const customerLinks = [
    { to: "/dashboard", label: "My Bookings", icon: CalendarDaysIcon },
    { to: "/wishlist", label: "Wishlist", icon: HeartIcon },
    { to: "/profile", label: "My Profile", icon: UserCircleIcon },
  ];

  // Links to show in navbar based on role
  const getNavLinks = () => {
    if (isAdmin) {
      return [...mainNavLinks, ...adminLinks];
    }
    if (isAuthenticated) {
      return [...mainNavLinks, ...customerLinks];
    }
    return mainNavLinks;
  };

  const navLinks = getNavLinks();

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg shadow-black/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-gray-900 text-lg group-hover:scale-110 transition-transform">
              W
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:inline">
              Wheelz
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.to}
                onClick={() => handleNavigation(link.to)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive(link.to)
                    ? "bg-amber-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-amber-500"
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? (
                <SunIcon className="w-5 h-5 text-amber-400" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Special Offers Badge */}
            <button
              onClick={() => handleNavigation("/offers")}
              className="hidden lg:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full"
            >
              <GiftIcon className="w-3 h-3" />
              Offers
            </button>

            {isAuthenticated ? (
              <>
                {/* Wishlist Icon */}
                {!isAdmin && (
                  <button
                    onClick={() => handleNavigation("/wishlist")}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                  >
                    <HeartIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleNavigation("/dashboard");
                            setProfileOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                        >
                          <CalendarDaysIcon className="w-4 h-4" /> My Bookings
                        </button>
                        <button
                          onClick={() => {
                            handleNavigation("/profile");
                            setProfileOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                        >
                          <UserCircleIcon className="w-4 h-4" /> Profile
                        </button>
                        {!isAdmin && (
                          <button
                            onClick={() => {
                              handleNavigation("/wishlist");
                              setProfileOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                          >
                            <HeartIcon className="w-4 h-4" /> My Wishlist
                          </button>
                        )}
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />{" "}
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => handleNavigation("/login")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-amber-500 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigation("/register")}
                  className="px-4 py-2 bg-amber-500 text-gray-900 font-semibold text-sm rounded-xl hover:bg-amber-400 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 md:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {menuOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-4 animate-slide-up max-h-[80vh] overflow-y-auto">
            {navLinks.map((link) => (
              <button
                key={link.to}
                onClick={() => {
                  handleNavigation(link.to);
                  setMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left ${
                  isActive(link.to)
                    ? "bg-amber-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {link.icon && <link.icon className="w-5 h-5" />}
                <span className="font-medium">{link.label}</span>
              </button>
            ))}

            <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
              <button
                onClick={() => {
                  handleNavigation("/offers");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-amber-500 font-medium"
              >
                <GiftIcon className="w-5 h-5" />
                Special Offers
              </button>
              <button
                onClick={() => {
                  handleNavigation("/contact");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-300"
              >
                <PhoneIcon className="w-5 h-5" />
                Support
              </button>
              <button
                onClick={() => {
                  handleNavigation("/about");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-300"
              >
                <InformationCircleIcon className="w-5 h-5" />
                About Us
              </button>
            </div>

            {!isAuthenticated && (
              <div className="flex gap-2 px-4 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                <button
                  onClick={() => {
                    handleNavigation("/login");
                    setMenuOpen(false);
                  }}
                  className="flex-1 text-center py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    handleNavigation("/register");
                    setMenuOpen(false);
                  }}
                  className="flex-1 text-center py-2.5 bg-amber-500 text-gray-900 rounded-xl font-semibold text-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
