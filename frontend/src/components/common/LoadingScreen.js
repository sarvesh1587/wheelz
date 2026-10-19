import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "../motion";

// Brief branded intro: the wordmark rises in while a counter runs to 100,
// then the whole panel lifts away like a curtain.
export default function LoadingScreen() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 1500, 1);
      setCount(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-canvas p-5 text-ink sm:p-8 lg:p-12"
      exit={{ y: "-100%" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow">Wheelz / India</span>
        <span className="eyebrow">Car &amp; bike rental</span>
      </div>

      <div className="overflow-hidden">
        <motion.h1
          initial={{ y: "105%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
          className="display text-[22vw] leading-[0.8] sm:text-[19vw]"
        >
          Wheelz<span className="text-accent">.</span>
        </motion.h1>
      </div>

      <div className="flex items-end justify-between">
        <div className="h-px w-1/2 overflow-hidden bg-line/10">
          <div
            className="h-full bg-accent transition-[width] duration-100"
            style={{ width: `${count}%` }}
          />
        </div>
        <span className="display-tight font-mono text-5xl tabular-nums sm:text-7xl">
          {String(count).padStart(3, "0")}
        </span>
      </div>
    </motion.div>
  );
}
