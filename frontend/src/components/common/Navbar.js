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
  CalendarDaysIcon,
  TruckIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  UserGroupIcon,
  SparklesIcon,
  HeartIcon,
  ShieldCheckIcon,
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

  // Desktop nav items
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/vehicles", label: "Vehicles" },
    { to: "/find-trip", label: "Find Trip" },
    { to: "/offer-trip", label: "Offer Trip" },
    {
      to: "/trip-planner",
      label: "Trip Planner",
      icon: SparklesIcon,
      highlight: true,
    },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-1.5 group"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="w-7 h-7 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center font-bold text-gray-900 text-sm">
              W
            </div>
            <span className="font-semibold text-lg text-gray-900 dark:text-white hidden sm:inline">
              Wheelz
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  location.pathname === item.to ||
                  location.pathname.startsWith(item.to + "/")
                    ? "bg-amber-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-amber-500"
                } ${item.highlight ? "bg-amber-50 dark:bg-amber-900/20" : ""}`}
              >
                {item.icon && <SparklesIcon className="w-3.5 h-3.5" />}
                {item.label}
                {item.highlight && (
                  <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full ml-1">
                    AI
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {dark ? (
                <SunIcon className="w-4 h-4 text-amber-400" />
              ) : (
                <MoonIcon className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <div className="w-7 h-7 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium hidden lg:block text-gray-700 dark:text-gray-200">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <CalendarDaysIcon className="w-4 h-4" /> Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate("/wishlist");
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <HeartIcon className="w-4 h-4" /> Wishlist
                    </button>
                    <button
                      onClick={() => {
                        navigate("/kyc");
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ShieldCheckIcon className="w-4 h-4" /> KYC Status
                    </button>
                    <button
                      onClick={() => {
                        navigate("/trip-requests");
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700 mt-1 pt-2"
                    >
                      <UserGroupIcon className="w-4 h-4 text-amber-500" />
                      Trip Requests
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          navigate("/admin");
                          setProfileOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <UserCircleIcon className="w-4 h-4" /> Admin Panel
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-1.5 text-sm font-medium hover:text-amber-500"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium rounded-lg"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 md:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {menuOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Fixed Background */}
        {menuOpen && (
          <div className="md:hidden fixed top-14 left-0 right-0 bg-white dark:bg-gray-900 shadow-xl border-t border-gray-200 dark:border-gray-700 z-50 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            <div className="py-3 px-4">
              <button
                onClick={() => {
                  navigate("/");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <HomeIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Home
                </span>
              </button>
              <button
                onClick={() => {
                  navigate("/vehicles");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <TruckIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">Vehicles</span>
              </button>
              <button
                onClick={() => {
                  navigate("/find-trip");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <UserGroupIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">Find Trip</span>
              </button>
              <button
                onClick={() => {
                  navigate("/offer-trip");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <UserGroupIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">Offer Trip</span>
              </button>

              {/* Trip Planner - Highlighted */}
              <button
                onClick={() => {
                  navigate("/trip-planner");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left bg-amber-50 dark:bg-amber-900/20 mt-2"
              >
                <SparklesIcon className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  AI Trip Planner
                </span>
                <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full ml-auto">
                  AI
                </span>
              </button>

              {/* Trip Requests - Mobile */}
              <button
                onClick={() => {
                  navigate("/trip-requests");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 mt-1"
              >
                <UserGroupIcon className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium">Trip Requests</span>
              </button>

              <div className="my-3 border-t border-gray-200 dark:border-gray-700"></div>

              {!isAuthenticated ? (
                <div className="flex gap-3 px-4 pt-2">
                  <button
                    onClick={() => {
                      navigate("/login");
                      setMenuOpen(false);
                    }}
                    className="flex-1 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate("/register");
                      setMenuOpen(false);
                    }}
                    className="flex-1 py-2.5 text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="px-4 pt-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
