/**
 * useConfetti — Custom hook for celebration confetti
 * File: frontend/src/hooks/useConfetti.js
 * Install: npm install canvas-confetti
 */

import { useCallback, useRef, useEffect } from "react";

const COLORS = {
  amber: ["#f59e0b", "#fbbf24", "#fcd34d"],
  green: ["#10b981", "#34d399", "#6ee7b7"],
  all: ["#f59e0b", "#fbbf24", "#10b981", "#ffffff", "#6366f1", "#f43f5e"],
};

export function useConfetti() {
  const confettiRef = useRef(null);
  const cleanupRef = useRef([]);

  const getConfetti = useCallback(async () => {
    if (confettiRef.current) return confettiRef.current;
    try {
      const mod = await import("canvas-confetti");
      confettiRef.current = mod.default || mod;
      return confettiRef.current;
    } catch (err) {
      console.warn("canvas-confetti not installed");
      return null;
    }
  }, []);

  useEffect(() => {
    return () => cleanupRef.current.forEach(clearTimeout);
  }, []);

  const schedule = (fn, delay) => {
    const id = setTimeout(fn, delay);
    cleanupRef.current.push(id);
  };

  const fireBookingConfetti = useCallback(async () => {
    const confetti = await getConfetti();
    if (!confetti) return;
    const colors = [...COLORS.amber, "#ffffff"];
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { x: 0.5, y: 0.5 },
      colors,
      zIndex: 9999,
      scalar: 1.2,
    });
    schedule(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 50,
        origin: { x: 0, y: 0.65 },
        colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 50,
        origin: { x: 1, y: 0.65 },
        colors,
        zIndex: 9999,
      });
    }, 250);
    schedule(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { x: 0.5, y: 0.6 },
        colors,
        zIndex: 9999,
      });
    }, 1000);
  }, [getConfetti]);

  const firePaymentConfetti = useCallback(async () => {
    const confetti = await getConfetti();
    if (!confetti) return;
    const colors = [...COLORS.green, ...COLORS.amber, "#ffffff"];
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.6 },
      colors,
      zIndex: 9999,
    });
    schedule(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors,
        zIndex: 9999,
      });
    }, 400);
  }, [getConfetti]);

  return { fireBookingConfetti, firePaymentConfetti };
}

export default useConfetti;
