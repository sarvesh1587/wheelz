import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { EASE } from "../motion";

// Floating glass pill for desktop navigation, adapted from the 21st.dev
// "Elevate Navbar". Hovering a link swaps its text upward and dims the others;
// items with `children` open a dropdown panel under the pill.

const SWAP = { duration: 0.35, ease: EASE };

// Two stacked copies of the label; the hover copy slides up into place.
function SwapText({ children, active }) {
  const reduce = useReducedMotion();
  const lift = active && !reduce;
  return (
    <span className="relative block overflow-hidden">
      <motion.span className="block" animate={{ y: lift ? "-100%" : "0%" }} transition={SWAP}>
        {children}
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute inset-0 block"
        initial={false}
        animate={{ y: lift ? "0%" : "100%" }}
        transition={SWAP}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function NavPill({ items, cta, isActive }) {
  const [hovered, setHovered] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [ctaHover, setCtaHover] = useState(false);
  const [itemHover, setItemHover] = useState(null);
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setOpenIndex(null);
    setHovered(null);
  }, [location]);

  const close = () => {
    setOpenIndex(null);
    setHovered(null);
  };

  const enter = (i) => {
    setHovered(i);
    setOpenIndex(items[i].children ? i : null);
  };

  const groupActive = (item) =>
    item.children ? item.children.some((c) => isActive(c.to)) : isActive(item.to);

  const linkTone = (i, item) => {
    if (hovered !== null) return hovered === i ? "text-ink" : "text-ink/35";
    return groupActive(item) ? "text-ink" : "text-ink/70";
  };

  const open = openIndex !== null ? items[openIndex] : null;

  return (
    <div
      ref={wrapRef}
      onMouseLeave={close}
      onKeyDown={(e) => e.key === "Escape" && close()}
      onBlur={(e) => !wrapRef.current?.contains(e.relatedTarget) && close()}
      className="absolute left-1/2 hidden -translate-x-1/2 md:block"
    >
      <div className="flex items-center gap-1 rounded-full border border-line/10 bg-surface/70 p-1.5 pl-5 shadow-lg shadow-black/5 backdrop-blur-xl">
        <ul className="mr-2 flex items-center gap-7">
          {items.map((item, i) => {
            const tone = `${linkTone(i, item)} transition-colors duration-300`;
            const label = (
              <>
                {groupActive(item) && <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />}
                <SwapText active={hovered === i}>{item.label}</SwapText>
              </>
            );
            return (
              <li key={item.label} onMouseEnter={() => enter(i)}>
                {item.children ? (
                  <button
                    type="button"
                    aria-expanded={openIndex === i}
                    aria-haspopup="true"
                    onClick={() => (openIndex === i ? close() : enter(i))}
                    onFocus={() => enter(i)}
                    className={`flex items-center gap-1.5 py-2 font-mono text-[12px] uppercase tracking-wider ${tone}`}
                  >
                    {label}
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 ${openIndex === i ? "-rotate-180" : ""}`}
                    />
                  </button>
                ) : (
                  <Link
                    to={item.to}
                    aria-current={isActive(item.to) ? "page" : undefined}
                    onFocus={() => enter(i)}
                    className={`flex items-center gap-1.5 py-2 font-mono text-[12px] uppercase tracking-wider ${tone}`}
                  >
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {cta && (
          <Link
            to={cta.to}
            onMouseEnter={() => {
              setCtaHover(true);
              close();
            }}
            onMouseLeave={() => setCtaHover(false)}
            onFocus={() => setCtaHover(true)}
            onBlur={() => setCtaHover(false)}
            className={`rounded-full px-4 py-2.5 font-mono text-[12px] uppercase tracking-wider transition-colors duration-300 ${
              ctaHover ? "bg-ink text-canvas" : "bg-accent text-accent-ink"
            }`}
          >
            <SwapText active={ctaHover}>{cta.label}</SwapText>
          </Link>
        )}
      </div>

      {/* Dropdown panel, same width as the pill */}
      <AnimatePresence>
        {open && (
          <motion.div
            key={open.label}
            className="absolute inset-x-0 top-full space-y-1.5 pt-2"
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{
              show: { transition: { staggerChildren: reduce ? 0 : 0.03 } },
              hidden: { transition: { staggerChildren: reduce ? 0 : 0.015, staggerDirection: -1 } },
            }}
          >
            {open.children.map(({ to, label, note, icon: Icon }) => (
              <motion.div
                key={to}
                variants={{
                  hidden: { opacity: 0, y: reduce ? 0 : -8, transition: { duration: 0.2 } },
                  show: { opacity: 1, y: 0, transition: SWAP },
                }}
              >
                <Link
                  to={to}
                  onMouseEnter={() => setItemHover(to)}
                  onMouseLeave={() => setItemHover(null)}
                  onFocus={() => setItemHover(to)}
                  onBlur={() => setItemHover(null)}
                  className="group flex items-center gap-4 rounded-2xl border border-line/10 bg-surface/90 p-2 pr-4 text-ink backdrop-blur-xl transition-[background-color,color,transform] duration-300 hover:scale-[1.02] hover:bg-accent hover:text-accent-ink motion-reduce:hover:scale-100"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-raised text-accent transition-colors duration-300 group-hover:bg-accent-ink/10 group-hover:text-accent-ink">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[12px] uppercase tracking-wider">
                      <SwapText active={itemHover === to}>{label}</SwapText>
                    </span>
                    <span className="mt-0.5 block truncate text-xs opacity-60">{note}</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 opacity-60" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
