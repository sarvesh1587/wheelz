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
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Wheelz" className="h-10 w-auto" />
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
