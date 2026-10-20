import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { EASE } from "../motion";

const WORD = "Wheelz";
const TAGS = ["Cars", "Bikes", "Rideshare", "Trip planner"];
const MIN_MS = 1400;
const MAX_MS = 4500;

// Spoked wheel that rolls along the road as loading progresses.
function Wheel({ spin }) {
  return (
    <motion.svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      animate={{ rotate: spin }}
      transition={{ ease: "linear", duration: 0.2 }}
      className="text-accent"
      aria-hidden
    >
      <circle cx="22" cy="22" r="19" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="22" cy="22" r="4" fill="currentColor" />
      {[0, 60, 120].map((a) => (
        <line
          key={a}
          x1="22"
          y1="5"
          x2="22"
          y2="39"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${a} 22 22)`}
        />
      ))}
    </motion.svg>
  );
}

// Branded intro. Progress follows real readiness (web fonts and the window
// load event) with a short minimum so it never just blinks, then the panel
// lifts away. Calls onDone once the exit can start.
export default function LoadingScreen({ onDone }) {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [tag, setTag] = useState(0);
  const ready = useRef(false);
  const startedAt = useRef(performance.now());

  useEffect(() => {
    const fonts = document.fonts?.ready || Promise.resolve();
    const loaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener("load", r, { once: true }));
    Promise.all([fonts, loaded]).then(() => {
      ready.current = true;
    });
    const cap = setTimeout(() => {
      ready.current = true;
    }, MAX_MS);
    return () => clearTimeout(cap);
  }, []);

  useEffect(() => {
    // Time-based easing on a timer (not rAF), so a background tab, where
    // animation frames pause, still finishes the intro.
    let timer;
    let finishAt = null;
    let last = performance.now();
    let value = 0;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(now - last, 500);
      last = now;
      const elapsed = now - startedAt.current;
      const canFinish = ready.current && elapsed > MIN_MS;
      if (canFinish && finishAt === null) finishAt = now + 500;
      const target = canFinish ? 100 : 90;
      value += (target - value) * (1 - Math.exp(-dt / (canFinish ? 120 : 700)));
      if (finishAt !== null && now >= finishAt) value = 100;
      setProgress(value);
      if (value >= 100) {
        setTimeout(() => onDone?.(), 200);
        return;
      }
      timer = setTimeout(tick, 16);
    };
    timer = setTimeout(tick, 16);
    return () => clearTimeout(timer);
  }, [onDone]);

  useEffect(() => {
    const id = setInterval(() => setTag((t) => (t + 1) % TAGS.length), 650);
    return () => clearInterval(id);
  }, []);

  const pct = Math.round(progress);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-canvas p-5 text-ink sm:p-8 lg:p-12"
      exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
      initial={{ clipPath: "inset(0 0 0% 0)" }}
      transition={{ duration: 1, ease: EASE }}
      role="status"
      aria-label={`Loading Wheelz, ${pct}%`}
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow">Wheelz / Pune, India</span>
        <span className="eyebrow">Car &amp; bike rental</span>
      </div>

      <div>
        <h1 className="display flex text-[22vw] leading-[0.82] sm:text-[19vw]" aria-hidden>
          {WORD.split("").map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.06em]">
              <motion.span
                className="inline-block"
                initial={reduce ? false : { y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: EASE, delay: 0.08 + i * 0.06 }}
              >
                {ch}
              </motion.span>
            </span>
          ))}
          <motion.span
            className="inline-block text-accent"
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.55 }}
          >
            .
          </motion.span>
        </h1>

        <div className="mt-4 h-8 overflow-hidden sm:mt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={tag}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="display-tight text-2xl text-muted"
            >
              {TAGS[tag]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div>
        {/* Road with a rolling wheel */}
        <div className="relative mb-6 h-11">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line/10" />
          <div
            className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-accent"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 h-px w-full -translate-y-1/2 opacity-40 motion-safe:animate-[road_0.8s_linear_infinite]"
            style={{
              backgroundImage: "linear-gradient(90deg, rgb(var(--line) / 0.5) 50%, transparent 50%)",
              backgroundSize: "24px 1px",
              marginTop: 10,
            }}
          />
          <div className="absolute top-0" style={{ left: `calc(${progress}% - 22px)` }}>
            <Wheel spin={progress * 12} />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <span className="eyebrow">{pct < 100 ? "Warming up the engine" : "Ready"}</span>
          <span className="display-tight font-mono text-5xl tabular-nums sm:text-7xl">
            {String(pct).padStart(3, "0")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Slim progress bar for lazy route chunks, so page changes don't flash a
// full-screen spinner.
export function RouteProgress() {
  return (
    <div className="fixed inset-x-0 top-0 z-[90] h-0.5 overflow-hidden" role="progressbar" aria-label="Loading page">
      <div className="h-full w-1/3 animate-[route_1s_ease-in-out_infinite] rounded-full bg-accent" />
    </div>
  );
}
