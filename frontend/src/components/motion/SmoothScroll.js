import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

let lenis = null;

export const getLenis = () => lenis;

// Wraps the app with inertia scrolling. Skipped for reduced-motion users
// and touch devices, where native scrolling already feels right.
export default function SmoothScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Every route starts at the top; don't let the browser restore old offsets.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || touch) return undefined;

    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    let frame;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenis = null;
    };
  }, []);

  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
