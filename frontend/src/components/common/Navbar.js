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
  BellIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Sample notifications (can be replaced with live data from API)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New vendor registration pending",
      time: "5 min ago",
      read: false,
    },
    {
      id: 2,
      message: "New booking received for Hyundai Creta",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      message: "Vehicle added successfully",
      time: "2 hours ago",
      read: true,
    },
    {
      id: 4,
      message: "Payment received: ₹2,500",
      time: "5 hours ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setShowNotifications(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/vehicles") return location.pathname === "/vehicles";
    if (path === "/admin") return location.pathname === "/admin";
    if (path === "/admin/vehicles")
      return location.pathname === "/admin/vehicles";
    if (path === "/admin/reports")
      return location.pathname === "/admin/reports";
    return location.pathname === path;
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // Navigation links based on role
  const mainNavLinks = [{ to: "/", label: "Home", icon: HomeIcon }];

  const adminLinks = [
    { to: "/admin/vehicles", label: "Manage Vehicles", icon: TruckIcon },
    { to: "/admin/reports", label: "Reports", icon: ChartBarIcon },
  ];

  const customerLinks = [
    { to: "/vehicles", label: "All Vehicles", icon: TruckIcon },
  ];

  const getNavLinks = () => {
    if (isAdmin) return [...mainNavLinks, ...adminLinks];
    if (isAuthenticated) return [...mainNavLinks, ...customerLinks];
    return [
      ...mainNavLinks,
      { to: "/vehicles", label: "All Vehicles", icon: TruckIcon },
    ];
  };

  const navLinks = getNavLinks();
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
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? (
                <SunIcon className="w-5 h-5 text-amber-400" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative"
              >
                <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-amber-500 hover:text-amber-600"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${
                            !notif.read
                              ? "bg-amber-50 dark:bg-amber-900/20"
                              : ""
                          }`}
                        >
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notif.time}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <button className="text-xs text-amber-500 w-full text-center hover:underline">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Help Button */}
            <button
              onClick={() => handleNavigation("/contact")}
              className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm rounded-full hover:bg-blue-500/20 transition"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              Help
            </button>

            {/* Rent Your Vehicle Button */}
            <button
              onClick={() => handleNavigation("/vendor/register")}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <BuildingStorefrontIcon className="w-4 h-4" />
              List Vehicle
            </button>

            {/* Profile Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                </button>

                {profileOpen && user && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
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
                          handleNavigation("/wishlist");
                          setProfileOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                      >
                        <HeartIcon className="w-4 h-4" /> Wishlist
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
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              handleNavigation("/admin");
                              setProfileOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                          >
                            <ChartBarIcon className="w-4 h-4" /> Admin Dashboard
                          </button>
                          <button
                            onClick={() => {
                              handleNavigation("/admin/reports");
                              setProfileOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                          >
                            <ChartBarIcon className="w-4 h-4" /> Reports
                          </button>
                        </>
                      )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
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
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4 animate-slide-up max-h-[80vh] overflow-y-auto">
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

            <button
              onClick={() => {
                handleNavigation("/contact");
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-blue-600 dark:text-blue-400 border-t border-gray-200 dark:border-gray-700 mt-2 pt-3"
            >
              <ChatBubbleLeftIcon className="w-5 h-5" />
              Help & Support
            </button>

            <button
              onClick={() => {
                handleNavigation("/vendor/register");
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-green-600 dark:text-green-400"
            >
              <BuildingStorefrontIcon className="w-5 h-5" />
              List Your Vehicle
            </button>

            {!isAuthenticated && (
              <div className="flex gap-2 px-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
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
