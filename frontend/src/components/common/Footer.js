import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
            <div className="flex gap-3 mt-4">
              <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs hover:bg-amber-500 hover:text-gray-900 cursor-pointer transition-colors">
                F
              </span>
              <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs hover:bg-amber-500 hover:text-gray-900 cursor-pointer transition-colors">
                T
              </span>
              <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs hover:bg-amber-500 hover:text-gray-900 cursor-pointer transition-colors">
                I
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/vehicles?category=car"
                  className="hover:text-amber-400 transition-colors"
                >
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link
                  to="/vehicles?category=bike"
                  className="hover:text-amber-400 transition-colors"
                >
                  Browse Bikes
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="hover:text-amber-400 cursor-pointer transition-colors">
                  24/7 Support
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer transition-colors">
                  Cancellation Policy
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer transition-colors">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} Wheelz. All rights reserved.
          </p>
          <p className="text-sm flex items-center gap-1.5">
            Powered by{" "}
            <span className="text-amber-400 font-medium">Claude AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
