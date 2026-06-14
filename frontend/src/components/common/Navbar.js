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
  PlusCircleIcon,
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

  const navItems = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/vehicles", label: "Vehicles", icon: TruckIcon },
    { to: "/find-trip", label: "Find Trip", icon: UserGroupIcon },
    { to: "/offer-trip", label: "Offer Trip", icon: PlusCircleIcon },
    {
      to: "/vendor/register",
      label: "List Vehicle",
      icon: TruckIcon,
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
          {/* Logo - Clean, No AI badge */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
              W
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">
              Wheelz
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  location.pathname === item.to
                    ? "bg-amber-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                } ${item.highlight ? "border border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20" : ""}`}
              >
                {item.icon && <item.icon className="w-3.5 h-3.5" />}
                {item.label}
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
                  <div className="w-7 h-7 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>

                    {/* Dashboard */}
                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <CalendarDaysIcon className="w-4 h-4" /> Dashboard
                    </button>

                    {/* Wishlist */}
                    <button
                      onClick={() => {
                        navigate("/wishlist");
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <HeartIcon className="w-4 h-4" /> Wishlist
                    </button>

                    {/* KYC */}
                    <button
                      onClick={() => {
                        navigate("/kyc");
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ShieldCheckIcon className="w-4 h-4" /> KYC
                    </button>

                    {/* Trip Requests */}
                    <button
                      onClick={() => {
                        navigate("/trip-requests");
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700 mt-1 pt-2"
                    >
                      <UserGroupIcon className="w-4 h-4 text-amber-500" /> Trip
                      Requests
                    </button>

                    {/* AI Trip Planner - Below Trip Requests */}
                    <button
                      onClick={() => {
                        navigate("/trip-planner");
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                    >
                      <SparklesIcon className="w-4 h-4" /> AI Trip Planner
                      <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full ml-auto">
                        AI
                      </span>
                    </button>

                    {/* Admin */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          navigate("/admin");
                          setProfileOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700 mt-1 pt-2"
                      >
                        <UserCircleIcon className="w-4 h-4" /> Admin Panel
                      </button>
                    )}

                    {/* Logout - Bottom */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-100 dark:border-gray-700 mt-1 pt-2"
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
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-amber-500"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600"
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

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden fixed top-14 left-0 right-0 bg-white dark:bg-gray-900 shadow-xl border-t border-gray-200 dark:border-gray-700 z-50">
            <div className="py-2 px-4 space-y-1">
              {[
                { to: "/", label: "Home", icon: HomeIcon },
                { to: "/vehicles", label: "Vehicles", icon: TruckIcon },
                { to: "/find-trip", label: "Find Trip", icon: UserGroupIcon },
                {
                  to: "/offer-trip",
                  label: "Offer Trip",
                  icon: PlusCircleIcon,
                },
                {
                  to: "/vendor/register",
                  label: "List Vehicle",
                  icon: TruckIcon,
                },
              ].map((item) => (
                <button
                  key={item.to}
                  onClick={() => {
                    navigate(item.to);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <item.icon className="w-5 h-5 text-gray-400" />
                  {item.label}
                </button>
              ))}

              {/* AI Trip Planner in mobile */}
              <button
                onClick={() => {
                  navigate("/trip-planner");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
              >
                <SparklesIcon className="w-5 h-5 text-amber-500" />
                AI Trip Planner
                <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full ml-auto">
                  AI
                </span>
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                {!isAuthenticated ? (
                  <div className="flex gap-3 px-1">
                    <button
                      onClick={() => {
                        navigate("/login");
                        setMenuOpen(false);
                      }}
                      className="flex-1 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        navigate("/register");
                        setMenuOpen(false);
                      }}
                      className="flex-1 py-2.5 text-sm font-medium bg-amber-500 text-white rounded-lg"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
