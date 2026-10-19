import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

export const EASE = [0.16, 1, 0.3, 1];

// Fades and lifts content into place the first time it scrolls into view.
export function Reveal({
  children,
  as = "div",
  delay = 0,
  y = 28,
  className = "",
  ...rest
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Splits text into words and slides each one up from behind a mask.
// Pass `lines` as an array to control where the headline breaks.
export function SplitText({
  lines,
  className = "",
  lineClassName = "",
  delay = 0,
  stagger = 0.06,
  inView = false,
}) {
  const reduce = useReducedMotion();
  let index = 0;
  const trigger = inView
    ? { whileInView: "show", viewport: { once: true, margin: "-10% 0px" } }
    : { animate: "show" };

  return (
    <motion.span
      className={`block ${className}`}
      initial={reduce ? false : "hidden"}
      {...trigger}
      aria-label={lines.join(" ")}
    >
      {lines.map((line, li) => (
        <span key={li} className={`block ${lineClassName}`} aria-hidden>
          {line.split(" ").map((word, wi) => {
            const i = index++;
            return (
              <span
                key={wi}
                className="inline-block overflow-hidden pb-[0.08em] align-bottom"
              >
                <motion.span
                  className="inline-block will-change-transform"
                  variants={{
                    hidden: { y: "110%" },
                    show: {
                      y: "0%",
                      transition: {
                        duration: 1.1,
                        ease: EASE,
                        delay: delay + i * stagger,
                      },
                    },
                  }}
                >
                  {word}
                  {wi < line.split(" ").length - 1 ? " " : ""}
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </motion.span>
  );
}

// Pulls its child toward the cursor while hovered.
export function Magnetic({ children, strength = 0.35, className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });

  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Infinite horizontal ticker. Content is duplicated so the loop is seamless.
export function Marquee({ children, className = "", reverse = false }) {
  return (
    <div className={`relative flex overflow-hidden ${className}`}>
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className="flex shrink-0 animate-marquee items-center"
          style={{ animationDirection: reverse ? "reverse" : "normal" }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

// Small numbered section label, e.g. "(02) Featured fleet".
export function Eyebrow({ index, children, className = "" }) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${className}`}>
      {index && <span className="text-accent">({index})</span>}
      <span>{children}</span>
    </p>
  );
}
