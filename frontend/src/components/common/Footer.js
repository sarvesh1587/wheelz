import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BuildingStorefrontIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Subscribed! 🎉 Check your inbox for updates");
      setEmail("");
      setIsSubscribing(false);
    }, 1000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Footer sections data
  const quickLinks = [
    { label: "Browse Cars", path: "/vehicles?category=car", icon: "🚗" },
    { label: "Browse Bikes", path: "/vehicles?category=bike", icon: "🏍️" },
    { label: "All Vehicles", path: "/vehicles", icon: "🚙" },
    { label: "How it Works", path: "/#how-it-works", isHash: true },
  ];

  const supportLinks = [
    {
      label: "24/7 Support",
      icon: <PhoneIcon className="w-4 h-4" />,
      href: "mailto:support@wheelz.com",
    },
    {
      label: "Contact Us",
      path: "/contact",
      icon: <EnvelopeIcon className="w-4 h-4" />,
    },
    {
      label: "About Us",
      path: "/about",
      icon: <BuildingStorefrontIcon className="w-4 h-4" />,
    },
    {
      label: "Terms of Service",
      path: "/terms",
      icon: <ShieldCheckIcon className="w-4 h-4" />,
    },
    {
      label: "Privacy Policy",
      path: "/privacy",
      icon: <ShieldCheckIcon className="w-4 h-4" />,
    },
  ];

  const paymentMethods = [
    { name: "Razorpay", icon: "💳", color: "from-blue-500 to-blue-600" },
    { name: "UPI", icon: "📱", color: "from-green-500 to-green-600" },
    { name: "Cards", icon: "💳", color: "from-purple-500 to-purple-600" },
    { name: "NetBanking", icon: "🏦", color: "from-orange-500 to-orange-600" },
  ];

  return (
    <>
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-400 mt-auto overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-pink-500/5 animate-pulse" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float delay-1000" />

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center font-bold text-gray-900 text-xl shadow-lg"
                >
                  W
                </motion.div>
                <span className="font-bold text-xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Wheelz
                </span>
              </div>
              <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
                Premium car and bike rentals across India.
                <span className="block mt-2 text-amber-400">
                  Travel smarter, arrive in style.
                </span>
              </p>

              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPinIcon className="w-4 h-4 text-amber-500" />
                  <span>15+ Cities across India</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <ClockIcon className="w-4 h-4 text-amber-500" />
                  <span>24/7 Customer Support</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-500 rounded-full" />
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, idx) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {link.isHash ? (
                      <button
                        onClick={() => {
                          navigate("/");
                          setTimeout(() => {
                            const element =
                              document.getElementById("how-it-works");
                            if (element)
                              element.scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }}
                        className="flex items-center gap-2 text-sm hover:text-amber-400 transition-all duration-300 hover:translate-x-2 group"
                      >
                        <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                        {link.icon && <span>{link.icon}</span>}
                        <span>{link.label}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNavigation(link.path)}
                        className="flex items-center gap-2 text-sm hover:text-amber-400 transition-all duration-300 hover:translate-x-2 group"
                      >
                        <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                        {link.icon && <span>{link.icon}</span>}
                        <span>{link.label}</span>
                      </button>
                    )}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-500 rounded-full" />
                Support
              </h4>
              <ul className="space-y-3">
                {supportLinks.map((link, idx) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {link.href ? (
                      <a
                        href={link.href}
                        className="flex items-center gap-2 text-sm hover:text-amber-400 transition-all duration-300 hover:translate-x-2 group"
                      >
                        <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                        {link.icon}
                        <span>{link.label}</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => handleNavigation(link.path)}
                        className="flex items-center gap-2 text-sm hover:text-amber-400 transition-all duration-300 hover:translate-x-2 group"
                      >
                        <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                        {link.icon}
                        <span>{link.label}</span>
                      </button>
                    )}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Newsletter & Payment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-amber-500 rounded-full" />
                  Subscribe
                </h4>
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubscribing}
                      className="absolute right-1 top-1 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-semibold text-sm rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSubscribing ? (
                        <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Subscribe"
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>

              {/* Payment Methods */}
              <div>
                <h4 className="text-white font-semibold mb-3">
                  Secure Payments
                </h4>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.name}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className={`px-3 py-1.5 bg-gradient-to-r ${method.color} bg-opacity-20 rounded-lg text-white text-xs font-medium flex items-center gap-1`}
                    >
                      <span>{method.icon}</span>
                      <span>{method.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Made with love */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <HeartIcon className="w-3 h-3 text-red-500 animate-pulse" />
                <span>Made with love for Indian travelers</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Wheelz. All rights reserved.
            </p>
            <div className="flex gap-6">
              <span className="text-xs text-gray-600 hover:text-amber-500 cursor-pointer transition-colors">
                Secure Payments
              </span>
              <span className="text-xs text-gray-600 hover:text-amber-500 cursor-pointer transition-colors">
                Razorpay Verified
              </span>
            </div>
          </motion.div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all duration-300 group"
          >
            <ArrowUpIcon className="w-5 h-5 text-gray-900 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}
