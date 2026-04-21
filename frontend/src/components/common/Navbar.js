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
  BuildingStorefrontIcon,
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

  const handleNavigation = (path) => navigate(path);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
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
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {dark ? (
                <SunIcon className="w-5 h-5 text-amber-400" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Rent Your Vehicle Button */}
            <button
              onClick={() => handleNavigation("/vendor/register")}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-md"
            >
              <BuildingStorefrontIcon className="w-4 h-4" />
              List Vehicle
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium hidden lg:block">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                </button>

                {profileOpen && user && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border py-2 z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold text-sm">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                      {user?.role === "vendor" && (
                        <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Vendor
                        </span>
                      )}
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleNavigation("/dashboard");
                          setProfileOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
                      >
                        <CalendarDaysIcon className="w-4 h-4" /> My Bookings
                      </button>
                      <button
                        onClick={() => {
                          handleNavigation("/wishlist");
                          setProfileOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
                      >
                        <HeartIcon className="w-4 h-4" /> Wishlist
                      </button>
                      <button
                        onClick={() => {
                          handleNavigation("/profile");
                          setProfileOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
                      >
                        <UserCircleIcon className="w-4 h-4" /> Profile
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            handleNavigation("/admin");
                            setProfileOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
                        >
                          <ChartBarIcon className="w-4 h-4" /> Admin Panel
                        </button>
                      )}
                      {user?.role === "vendor" && (
                        <button
                          onClick={() => {
                            handleNavigation("/vendor/dashboard");
                            setProfileOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
                        >
                          <ChartBarIcon className="w-4 h-4" /> Vendor Dashboard
                        </button>
                      )}
                    </div>
                    <div className="border-t mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => handleNavigation("/login")}
                  className="px-4 py-2 text-sm font-medium hover:text-amber-500"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigation("/register")}
                  className="px-4 py-2 bg-amber-500 text-gray-900 font-semibold text-sm rounded-xl"
                >
                  Sign Up
                </button>
              </div>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 md:hidden rounded-lg hover:bg-gray-100"
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
          <div className="md:hidden bg-white dark:bg-gray-900 border-t py-4">
            {navLinks.map((link) => (
              <button
                key={link.to}
                onClick={() => {
                  handleNavigation(link.to);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left hover:bg-gray-50"
              >
                {link.icon && <link.icon className="w-5 h-5" />}
                <span className="font-medium">{link.label}</span>
              </button>
            ))}
            <button
              onClick={() => {
                handleNavigation("/vendor/register");
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-green-600 border-t mt-2 pt-3"
            >
              <BuildingStorefrontIcon className="w-5 h-5" />
              List Vehicle
            </button>
            {!isAuthenticated && (
              <div className="flex gap-2 px-4 pt-4 border-t mt-2">
                <button
                  onClick={() => {
                    handleNavigation("/login");
                    setMenuOpen(false);
                  }}
                  className="flex-1 text-center py-2.5 border rounded-xl"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    handleNavigation("/register");
                    setMenuOpen(false);
                  }}
                  className="flex-1 text-center py-2.5 bg-amber-500 rounded-xl"
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
