import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-gray-900 text-lg">
                W
              </div>
              <span className="font-bold text-xl text-white">Wheelz</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Premium car and bike rentals across India. Travel smarter, arrive
              in style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/vehicles?category=car"
                  className="hover:text-amber-400 transition-colors block"
                >
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link
                  to="/vehicles?category=bike"
                  className="hover:text-amber-400 transition-colors block"
                >
                  Browse Bikes
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate("/");
                    setTimeout(() => {
                      document
                        .getElementById("how-it-works")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  How it Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/vehicles")}
                  className="hover:text-amber-400 transition-colors"
                >
                  All Vehicles
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() =>
                    (window.location.href = "mailto:support@wheelz.com")
                  }
                  className="hover:text-amber-400 transition-colors"
                >
                  24/7 Support
                </button>
              </li>
              // Add this in the Quick Links or Support section
              <li>
                <Link
                  to="/contact"
                  className="hover:text-amber-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              // In Footer.js, add these links
              <li>
                <Link
                  to="/about"
                  className="hover:text-amber-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-amber-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="hover:text-amber-400 transition-colors"
                >
                  Cancellation Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="hover:text-amber-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="hover:text-amber-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} Wheelz. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-gray-500">Secure Payments</span>
            <span className="text-xs text-gray-500">Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
