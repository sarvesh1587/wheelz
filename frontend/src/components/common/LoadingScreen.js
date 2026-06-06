/**
 * WHEELZ - Ultra Premium Loading Experience
 * File: frontend/src/components/common/LoadingScreen.js
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [phase, setPhase] = useState("countdown"); // countdown → drive → ready
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [funFact, setFunFact] = useState(0);

  const funFacts = [
    "Did you know? Carpooling reduces CO2 by 50% 🌍",
    "Fun fact: India's longest road trip is 4000+ km! 🛣️",
    "Tip: Book early for up to 40% discount 💰",
    "Wheelz fact: 10,000+ happy travelers joined this month 🎉",
    "Travel hack: Split costs = Travel more! ✈️",
    "Mumbai to Goa? ₹499 per seat only 🏖️",
    "Safety first: All drivers are verified ✅",
    "Wheelz is in 50+ cities across India 🇮🇳",
  ];

  useEffect(() => {
    // COUNTDOWN PHASE
    if (phase === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 800);
      return () => clearTimeout(timer);
    }
    if (phase === "countdown" && countdown === 0) {
      setTimeout(() => setPhase("drive"), 300);
    }

    // DRIVE PHASE - Progress loading
    if (phase === "drive") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase("ready"), 500);
            return 100;
          }
          // Random but faster progress
          return Math.min(prev + Math.random() * 8 + 2, 100);
        });
      }, 100);

      // Rotate fun facts
      const factInterval = setInterval(() => {
        setFunFact((prev) => (prev + 1) % funFacts.length);
      }, 2000);

      return () => {
        clearInterval(interval);
        clearInterval(factInterval);
      };
    }
  }, [phase, countdown]);

  const handleLogoClick = () => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 5) {
        setShowEasterEgg(true);
        setTimeout(() => setShowEasterEgg(false), 3000);
        return 0;
      }
      return newCount;
    });
  };

  return (
    <div className="fixed inset-0 bg-[#0A0F1A] z-[99999] overflow-hidden cursor-wait">
      {/* ⭐ ANIMATED STARS BACKGROUND */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.5, 0.8],
            }}
            transition={{
              duration: 1.5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* 🌐 MOVING GRID */}
      <motion.div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(245,158,11,0.3) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "50px 50px"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* 🚗 RACING CIRCUIT (Background) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-5"
        viewBox="0 0 1000 1000"
      >
        <motion.path
          d="M 100 500 Q 250 200, 500 200 Q 750 200, 900 500 Q 750 800, 500 800 Q 250 800, 100 500 Z"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle
          r="5"
          fill="#fbbf24"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{
            offsetPath:
              "path('M 100 500 Q 250 200, 500 200 Q 750 200, 900 500 Q 750 800, 500 800 Q 250 800, 100 500 Z')",
          }}
        />
      </svg>

      {/* 🎯 MAIN CONTENT */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        {/* COUNTDOWN PHASE */}
        <AnimatePresence>
          {phase === "countdown" && (
            <motion.div
              key="countdown"
              initial={{ scale: 3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-center"
            >
              {countdown > 0 ? (
                <motion.div
                  key={countdown}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative"
                >
                  <div className="text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 leading-none">
                    {countdown}
                  </div>
                  <motion.div
                    className="absolute inset-0 text-[200px] font-black text-amber-400/20 blur-xl leading-none"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    {countdown}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-8xl"
                >
                  🏁
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* DRIVE PHASE */}
        <AnimatePresence>
          {phase === "drive" && (
            <motion.div
              key="drive"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              {/* Clickable Logo */}
              <motion.div
                onClick={handleLogoClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer relative inline-block"
              >
                <motion.div
                  className="absolute inset-0 bg-amber-500 rounded-3xl blur-2xl"
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative w-28 h-28 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/30">
                  <motion.span
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-6xl font-black text-white"
                  >
                    W
                  </motion.span>
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {clickCount}
                </motion.div>
              </motion.div>

              {/* Brand */}
              <div>
                <h1 className="text-7xl font-black text-white tracking-tighter">
                  <motion.span
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 bg-[length:200%] bg-clip-text text-transparent"
                    style={{ backgroundSize: "200% 100%" }}
                  >
                    WHEELZ
                  </motion.span>
                </h1>
                <motion.p
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-gray-500 text-sm tracking-[0.5em] uppercase mt-2"
                >
                  Premium Ridesharing
                </motion.p>
              </div>

              {/* RACING CAR ANIMATION */}
              <div className="relative w-80 h-20 mx-auto">
                {/* Road */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-full w-8 bg-white/[0.1]"
                      style={{ left: `${i * 40 + 5}px` }}
                      animate={{ x: [-400, 400] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>

                {/* Multiple cars racing */}
                <motion.div
                  className="absolute top-0 text-5xl"
                  animate={{ x: [0, 280, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🏎️
                  <motion.div
                    className="absolute -right-4 top-1/2 text-amber-400 text-lg"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  >
                    ⚡
                  </motion.div>
                </motion.div>

                <motion.div
                  className="absolute top-3 text-4xl opacity-50"
                  animate={{ x: [280, 0, 280] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🚙
                </motion.div>
              </div>

              {/* PROGRESS SECTION */}
              <div className="space-y-3">
                {/* Speedometer-style progress */}
                <div className="relative w-72 h-3 mx-auto">
                  <div className="absolute inset-0 bg-white/[0.03] rounded-full overflow-hidden backdrop-blur-sm border border-white/[0.05]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)",
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                  {/* Speed markers */}
                  {[25, 50, 75].map((mark) => (
                    <div
                      key={mark}
                      className="absolute top-0 w-0.5 h-3 bg-white/20"
                      style={{ left: `${mark}%` }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <motion.span
                    key={funFact}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-amber-400/60 font-medium"
                  >
                    {funFacts[funFact]}
                  </motion.span>
                  <span className="text-xs text-amber-400 font-mono font-bold">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>

              {/* Speed Stats */}
              <div className="flex gap-8 justify-center text-xs text-gray-600">
                <div className="text-center">
                  <p className="text-amber-400 font-bold">50+</p>
                  <p>Cities</p>
                </div>
                <div className="text-center">
                  <p className="text-amber-400 font-bold">10K+</p>
                  <p>Riders</p>
                </div>
                <div className="text-center">
                  <p className="text-amber-400 font-bold">₹499</p>
                  <p>Starting</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EASTER EGG */}
        <AnimatePresence>
          {showEasterEgg && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="fixed inset-0 flex items-center justify-center z-50"
            >
              <div className="text-center">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-9xl"
                >
                  🏆
                </motion.div>
                <p className="text-2xl font-bold text-amber-400 mt-4">
                  You found the secret!
                </p>
                <p className="text-gray-400">
                  Use code: WHEELZVIP for 50% off 🎉
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: phase === "drive" ? 1 : 0,
          y: phase === "drive" ? 0 : 20,
        }}
        className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-xs text-gray-600"
      >
        <span>🔒 Secure Payments</span>
        <span className="w-1 h-1 bg-gray-700 rounded-full self-center" />
        <span>✅ Verified Drivers</span>
        <span className="w-1 h-1 bg-gray-700 rounded-full self-center" />
        <span>⚡ Instant Booking</span>
        <span className="w-1 h-1 bg-gray-700 rounded-full self-center" />
        <span>🛡️ Trip Protection</span>
      </motion.div>
    </div>
  );
}
