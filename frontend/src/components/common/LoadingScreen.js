/**
 * WHEELZ - MEGA ULTRA LOADING EXPERIENCE v3.0
 * File: frontend/src/components/common/LoadingScreen.js
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [phase, setPhase] = useState("countdown");
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const [boost, setBoost] = useState(false);
  const [drift, setDrift] = useState(false);
  const [nitroParticles, setNitroParticles] = useState([]);
  const [smokeTrail, setSmokeTrail] = useState([]);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [gear, setGear] = useState(1);
  const [score, setScore] = useState(0);
  const carRef = useRef(null);

  // Generate smoke particles
  useEffect(() => {
    if (phase === "drive") {
      const interval = setInterval(() => {
        setSmokeTrail((prev) => {
          const newTrail = [
            ...prev,
            { id: Date.now(), x: Math.random() * 100, opacity: 1 },
          ];
          return newTrail.slice(-30);
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Generate nitro particles
  useEffect(() => {
    if (boost && phase === "drive") {
      const interval = setInterval(() => {
        setNitroParticles((prev) => {
          const newParticles = [
            ...prev,
            {
              id: Date.now(),
              x: Math.random() * 20 - 10,
              y: Math.random() * 20 - 10,
            },
          ];
          return newParticles.slice(-20);
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [boost, phase]);

  // Speed and gear system
  useEffect(() => {
    if (phase === "drive") {
      const interval = setInterval(() => {
        setSpeed((prev) => {
          const newSpeed = prev + (boost ? 15 : 5) + Math.random() * 10;
          if (newSpeed > 280) return 280;
          return newSpeed;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [phase, boost]);

  useEffect(() => {
    if (speed < 60) setGear(1);
    else if (speed < 120) setGear(2);
    else if (speed < 180) setGear(3);
    else if (speed < 240) setGear(4);
    else setGear(5);
  }, [speed]);

  // Progress loading
  useEffect(() => {
    if (phase === "drive") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase("ready"), 800);
            return 100;
          }
          return Math.min(prev + (boost ? 4 : 1.5), 100);
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [phase, boost]);

  // Countdown timer
  useEffect(() => {
    if (phase === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 900);
      return () => clearTimeout(timer);
    }
    if (phase === "countdown" && countdown === 0) {
      setTimeout(() => {
        setPhase("drive");
        setBoost(true);
        setTimeout(() => setBoost(false), 1500);
      }, 500);
    }
  }, [phase, countdown]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setBoost(true);
        setScore((prev) => prev + 10);
        setTimeout(() => setBoost(false), 1000);
      }
      if (e.code === "KeyD") {
        setDrift(true);
        setScore((prev) => prev + 25);
        setTimeout(() => setDrift(false), 800);
      }
      if (e.code === "KeyW") {
        setClickCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 5) {
            setShowEasterEgg(true);
            setTimeout(() => setShowEasterEgg(false), 4000);
            return 0;
          }
          return newCount;
        });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#060B14] z-[99999] overflow-hidden select-none">
      {/* 🌌 GALAXY BACKGROUND */}
      <div className="absolute inset-0">
        {/* Nebula effect */}
        <div
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(251,191,36,0.2) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 80%, rgba(245,158,11,0.15) 0%, transparent 50%)
            `,
          }}
        />

        {/* Stars */}
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: Math.random() > 0.8 ? "#fbbf24" : "#ffffff",
            }}
            animate={{
              opacity: [0.1, Math.random() * 0.8 + 0.2, 0.1],
              scale: [0.8, 1.5, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}

        {/* Shooting stars */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`shooting-${i}`}
            className="absolute h-0.5 w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
            style={{
              top: `${Math.random() * 50}%`,
              left: `${Math.random() * 80}%`,
              transform: "rotate(-25deg)",
            }}
            animate={{
              x: [-100, window.innerWidth + 100],
              opacity: [1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 3 + Math.random() * 2,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* 🏙️ CITY SKYLINE AT BOTTOM */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10">
        <div className="flex items-end justify-around h-full">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`building-${i}`}
              className="bg-amber-400"
              style={{
                width: `${Math.random() * 30 + 15}px`,
                height: `${Math.random() * 100 + 20}%`,
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        {/* COUNTDOWN PHASE */}
        <AnimatePresence>
          {phase === "countdown" && (
            <motion.div
              key="countdown"
              exit={{ scale: 0, opacity: 0 }}
              className="text-center relative"
            >
              {/* Traffic Lights */}
              <div className="flex flex-col gap-3 mb-8 mx-auto w-16 bg-gray-900/80 backdrop-blur-sm rounded-2xl p-3 border border-gray-800">
                {[0, 1, 2].map((light) => (
                  <motion.div
                    key={light}
                    className="w-10 h-10 rounded-full mx-auto"
                    style={{
                      background:
                        countdown <= light
                          ? light === 2
                            ? "#ef4444"
                            : light === 1
                              ? "#f59e0b"
                              : "#10b981"
                          : "#374151",
                    }}
                    animate={
                      countdown <= light
                        ? {
                            boxShadow: [
                              `0 0 20px ${light === 2 ? "#ef4444" : light === 1 ? "#f59e0b" : "#10b981"}40`,
                              `0 0 40px ${light === 2 ? "#ef4444" : light === 1 ? "#f59e0b" : "#10b981"}80`,
                              `0 0 20px ${light === 2 ? "#ef4444" : light === 1 ? "#f59e0b" : "#10b981"}40`,
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                ))}
              </div>

              {/* Countdown Number */}
              <motion.div
                key={countdown}
                initial={{ scale: 3, opacity: 0, rotateY: 180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="relative"
              >
                <div className="text-[250px] font-black bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 bg-clip-text text-transparent leading-none">
                  {countdown > 0 ? countdown : "GO!"}
                </div>
                <motion.div
                  className="absolute inset-0 text-[250px] font-black text-amber-500/30 blur-2xl leading-none"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {countdown > 0 ? countdown : "GO!"}
                </motion.div>
              </motion.div>

              <p className="text-gray-500 text-sm mt-4 tracking-widest uppercase">
                {countdown > 0 ? "Get Ready..." : "HERE WE GO!"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DRIVE PHASE - THE MAIN SHOW */}
        <AnimatePresence>
          {phase === "drive" && (
            <motion.div
              key="drive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-4xl mx-auto px-8"
            >
              {/* HEADER WITH SPEED STATS */}
              <div className="flex items-center justify-between mb-12 text-xs">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="flex items-center gap-2 bg-white/[0.03] backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/[0.05]"
                    animate={{
                      borderColor: boost
                        ? "rgba(245,158,11,0.5)"
                        : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <span className="text-gray-500">GEAR</span>
                    <motion.span
                      key={gear}
                      initial={{ scale: 2 }}
                      animate={{ scale: 1 }}
                      className="text-amber-400 font-bold text-lg"
                    >
                      {gear}
                    </motion.span>
                  </motion.div>

                  <div className="flex items-center gap-2 bg-white/[0.03] backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/[0.05]">
                    <span className="text-gray-500">RPM</span>
                    <motion.span className="text-green-400 font-mono font-bold">
                      {Math.round(speed * 30)}
                    </motion.span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/[0.03] backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/[0.05]">
                    <span className="text-gray-500">SCORE</span>
                    <motion.span className="text-amber-400 font-bold">
                      {score}
                    </motion.span>
                  </div>

                  <motion.div
                    animate={{ opacity: boost ? 1 : 0.3 }}
                    className="text-xs text-red-400 font-bold"
                  >
                    {boost ? "🔥 NITRO ACTIVE!" : "Press SPACE for NOS"}
                  </motion.div>
                </div>
              </div>

              {/* SPEEDOMETER */}
              <div className="text-center mb-12">
                <motion.div
                  className="inline-block relative"
                  animate={drift ? { rotate: [-5, 5, -5, 5] } : {}}
                  transition={{ duration: 0.1, repeat: drift ? Infinity : 0 }}
                >
                  <div className="text-[180px] font-black text-white leading-none tracking-tighter tabular-nums">
                    <motion.span
                      animate={{ color: boost ? "#fbbf24" : "#ffffff" }}
                      transition={{ duration: 0.3 }}
                    >
                      {Math.round(speed)}
                    </motion.span>
                  </div>
                  <div className="absolute -top-4 right-0 text-4xl text-gray-600 font-bold">
                    KM/H
                  </div>
                </motion.div>
              </div>

              {/* THE RACING TRACK */}
              <div className="relative h-40 mb-8 overflow-hidden">
                {/* Track surface */}
                <div className="absolute bottom-8 left-0 right-0 h-20 bg-gradient-to-b from-gray-800/50 to-gray-900/50 rounded-lg border border-white/[0.05]">
                  {/* Track lines */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-500/20 transform -translate-y-1/2" />
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={`line-${i}`}
                      className="absolute top-1/2 h-1 w-10 bg-yellow-500/40"
                      style={{ left: `${i * 60 + 20}px` }}
                      animate={{ x: [-800, 800] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  ))}
                </div>

                {/* ENEMY CARS */}
                <motion.div
                  className="absolute top-2 text-4xl"
                  animate={{ x: [800, -100] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  🚙
                </motion.div>
                <motion.div
                  className="absolute top-2 text-5xl"
                  animate={{ x: [900, -150] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 1,
                  }}
                >
                  🚕
                </motion.div>
                <motion.div
                  className="absolute top-2 text-3xl"
                  animate={{ x: [1000, -50] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.5,
                  }}
                >
                  🚌
                </motion.div>

                {/* PLAYER CAR */}
                <motion.div
                  ref={carRef}
                  className="absolute top-1 text-6xl z-20"
                  animate={{
                    x: drift ? [30, 50, 70] : progress * 5,
                    y: drift ? [0, -5, 0] : 0,
                    rotate: drift ? [-5, 5, -5] : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ left: `${Math.min(progress * 5, 80)}%` }}
                >
                  {/* Car with effects */}
                  <div className="relative">
                    🏎️
                    {/* NITRO FLAMES */}
                    {boost && (
                      <motion.div
                        className="absolute -left-8 top-1/2 -translate-y-1/2 flex gap-0.5"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 0.1, repeat: Infinity }}
                      >
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={`flame-${i}`}
                            className="text-2xl"
                            style={{
                              filter: `blur(${i}px)`,
                              opacity: 1 - i * 0.2,
                            }}
                          >
                            🔥
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                    {/* SMOKE TRAIL */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2">
                      {smokeTrail.slice(-8).map((particle, i) => (
                        <motion.div
                          key={particle.id}
                          className="absolute"
                          initial={{ opacity: 0.8, scale: 1, x: 0 }}
                          animate={{ opacity: 0, scale: 2, x: -50 - i * 10 }}
                          transition={{ duration: 0.8 }}
                          style={{ top: `${i * 8 - 20}px` }}
                        >
                          <div
                            className="w-4 h-4 rounded-full blur-sm"
                            style={{
                              background:
                                "radial-gradient(circle, rgba(255,255,255,0.6), rgba(200,200,200,0))",
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                    {/* NITRO PARTICLES */}
                    {boost &&
                      nitroParticles.map((particle) => (
                        <motion.div
                          key={particle.id}
                          className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full"
                          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                          animate={{ x: -100, y: -20, opacity: 0, scale: 0 }}
                          transition={{ duration: 0.5 }}
                        />
                      ))}
                  </div>
                </motion.div>
              </div>

              {/* PROGRESS BAR */}
              <div className="space-y-3">
                <div className="relative h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)",
                      width: `${progress}%`,
                      boxShadow: "0 0 20px rgba(245,158,11,0.4)",
                    }}
                  />

                  {/* Checkpoints */}
                  {[25, 50, 75, 100].map((checkpoint) => (
                    <div
                      key={checkpoint}
                      className="absolute top-0 w-0.5 h-2 bg-white/20"
                      style={{ left: `${checkpoint}%` }}
                    />
                  ))}
                </div>

                {/* Controls hint */}
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <motion.span
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ⌨️ SPACE = NITRO | D = DRIFT | W = ?
                  </motion.span>
                  <span className="text-amber-400 font-mono">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EASTER EGG */}
        <AnimatePresence>
          {showEasterEgg && (
            <motion.div
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0, rotateY: -180 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-center"
              >
                <div className="text-9xl">🏆</div>
                <h2 className="text-4xl font-black text-amber-400 mt-4">
                  LEGENDARY!
                </h2>
                <p className="text-gray-400 mt-2">Secret code unlocked:</p>
                <div className="mt-4 inline-block bg-amber-500 text-black font-bold text-2xl px-6 py-3 rounded-xl">
                  WHEELZRACER50
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  50% OFF your next ride!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM CONTROLS BAR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "drive" ? 1 : 0 }}
        className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 text-xs text-gray-700"
      >
        <span>🏎️ SPACE = Nitro Boost</span>
        <span>🔄 D = Drift</span>
        <span>🎯 W = Secret (5x)</span>
        <span>⭐ Score: {score}</span>
      </motion.div>
    </div>
  );
}
