/**
 * Premium Car-Themed Loading Screen for Wheelz
 * File: frontend/src/components/common/LoadingScreen.js
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0B1120] z-[99999] flex items-center justify-center overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />

      <div className="relative text-center z-10">
        {/* Car Animation */}
        <motion.div
          className="text-8xl mb-8"
          animate={{
            x: [0, 15, 0, -15, 0],
            y: [0, -5, 0, -5, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.span
            animate={{ rotate: [0, 2, 0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block"
          >
            🚗
          </motion.span>

          {/* Dust particles */}
          <motion.div
            className="absolute bottom-0 -left-6 text-xl"
            animate={{
              opacity: [0, 0.6, 0],
              x: [-5, -25, -45],
              y: [0, -5, -10],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            💨
          </motion.div>
          <motion.div
            className="absolute bottom-0 -left-3 text-lg"
            animate={{
              opacity: [0, 0.4, 0],
              x: [-3, -18, -35],
              y: [0, -3, -7],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          >
            💨
          </motion.div>
        </motion.div>

        {/* Road Line */}
        <div className="relative w-64 h-1.5 mx-auto mb-8 overflow-hidden rounded-full bg-white/[0.03]">
          <motion.div
            className="absolute top-0 h-full w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full"
            animate={{ x: [-70, 320] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full w-3 bg-white/[0.05]"
              style={{ left: `${i * 55 + 10}px` }}
            />
          ))}
        </div>

        {/* Logo & Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-amber-500/25">
              W
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent">
                Wheelz
              </span>
            </h1>
          </div>
          <p className="text-gray-500 text-xs tracking-widest uppercase mb-6">
            Premium Ridesharing
          </p>
        </motion.div>

        {/* Loading Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          <span className="text-xs text-gray-500 mr-2 tracking-wide">
            LOADING
          </span>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 bg-amber-500 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-48 mx-auto">
          <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 rounded-full"
              animate={{ width: `${Math.min(progress, 90)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <motion.p
        className="absolute bottom-8 text-xs text-gray-700 tracking-wider"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Travel Together, Pay Less
      </motion.p>
    </div>
  );
}
