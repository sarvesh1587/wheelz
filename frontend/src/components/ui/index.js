import React, { useEffect, useState } from "react";

// Resolved token colours for libraries (recharts, canvas) that can't read
// CSS variables. Re-reads when the light/dark class on <html> changes.
const TOKEN_NAMES = ["canvas", "surface", "raised", "ink", "muted", "line", "accent"];
function readTokens() {
  const css = getComputedStyle(document.documentElement);
  const out = {};
  TOKEN_NAMES.forEach((n) => {
    const v = css.getPropertyValue(`--${n}`).trim().split(/\s+/).join(", ");
    out[n] = `rgb(${v})`;
    out[`${n}A`] = (a) => `rgba(${v}, ${a})`;
  });
  return out;
}
export function useThemeColors() {
  const [colors, setColors] = useState(readTokens);
  useEffect(() => {
    const obs = new MutationObserver(() => setColors(readTokens()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return colors;
}
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { SplitText, Eyebrow, EASE } from "../motion";

// Editorial page header: numbered eyebrow, word-reveal headline, optional
// lede and actions aligned to the baseline on wide screens.
export function PageHeader({ index, eyebrow, title, lede, actions, size = "lg", className = "" }) {
  const lines = Array.isArray(title) ? title : [title];
  const sizes = {
    lg: "text-5xl md:text-7xl lg:text-8xl",
    md: "text-4xl md:text-6xl",
  };
  return (
    <header
      className={`mb-12 flex flex-col gap-6 border-b border-line/10 pb-10 md:mb-16 md:flex-row md:items-end md:justify-between ${className}`}
    >
      <div className="min-w-0">
        {eyebrow && (
          <Eyebrow index={index} className="mb-6">
            {eyebrow}
          </Eyebrow>
        )}
        <h1 className={`display ${sizes[size]}`}>
          <SplitText key={lines.join(" ")} lines={lines} />
        </h1>
        {lede && <p className="mt-6 max-w-xl text-muted">{lede}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

// Hairline card used for grouped content.
export function Panel({ as: Tag = "section", title, index, action, children, className = "", bodyClassName = "" }) {
  return (
    <Tag className={`rounded-[24px] border border-line/10 bg-surface p-6 md:p-8 ${className}`}>
      {(title || action) && (
        <div className="mb-6 flex items-center justify-between gap-4">
          {title && (
            <h2 className="eyebrow flex items-center gap-3">
              {index && <span className="text-accent">({index})</span>}
              <span>{title}</span>
            </h2>
          )}
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </Tag>
  );
}

// Label/value row for summaries and receipts.
export function Row({ label, children, strong = false, className = "" }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 border-b border-line/10 py-3 text-sm last:border-0 ${className}`}>
      <span className="text-muted">{label}</span>
      <span className={`text-right ${strong ? "font-semibold text-ink" : "text-ink"}`}>{children}</span>
    </div>
  );
}

// Big number tile for dashboards.
export function Stat({ label, value, hint, className = "" }) {
  return (
    <div className={`border-t border-line/10 pt-5 ${className}`}>
      <p className="eyebrow">{label}</p>
      <p className="display mt-3 text-4xl md:text-5xl">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const TONES = {
  positive: "bg-emerald-400",
  pending: "bg-accent",
  negative: "bg-red-500",
  neutral: "bg-line/40",
};

const STATUS_TONE = {
  confirmed: "positive",
  completed: "positive",
  approved: "positive",
  active: "positive",
  verified: "positive",
  paid: "positive",
  success: "positive",
  accepted: "positive",
  ongoing: "positive",
  pending: "pending",
  submitted: "pending",
  under_review: "pending",
  processing: "pending",
  upcoming: "pending",
  scheduled: "pending",
  cancelled: "negative",
  rejected: "negative",
  failed: "negative",
  declined: "negative",
  suspended: "negative",
  blocked: "negative",
};

// Small status pill: neutral outline with a coloured dot.
export function StatusPill({ status, tone, children, className = "" }) {
  const key = String(status || "").toLowerCase();
  const dot = TONES[tone || STATUS_TONE[key] || "neutral"];
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line/15 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink/80 ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {children || key.replace(/_/g, " ")}
    </span>
  );
}

// Pill-shaped segmented control.
export function Segmented({ options, value, onChange, className = "" }) {
  return (
    <div className={`inline-flex flex-wrap rounded-full border border-line/15 p-1 ${className}`}>
      {options.map(({ value: v, label }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === v ? "bg-ink text-canvas" : "text-muted hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

// Inline notice for success, warning and error messages.
export function Notice({ tone = "neutral", icon: Icon, title, children, className = "" }) {
  const dot = TONES[tone] || TONES.neutral;
  return (
    <div className={`flex gap-4 rounded-[20px] border border-line/10 bg-surface p-5 ${className}`}>
      {Icon ? (
        <Icon size={18} className={tone === "negative" ? "mt-0.5 shrink-0 text-red-500" : "mt-0.5 shrink-0 text-accent"} />
      ) : (
        <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${dot}`} />
      )}
      <div className="min-w-0 text-sm">
        {title && <p className="font-semibold text-ink">{title}</p>}
        {children && <div className={title ? "mt-1 text-muted" : "text-muted"}>{children}</div>}
      </div>
    </div>
  );
}

// Empty block with a large editorial line.
export function Empty({ title, children, action, className = "" }) {
  return (
    <div className={`border-t border-line/10 py-20 ${className}`}>
      <h3 className="display-tight text-3xl md:text-5xl">{title}</h3>
      {children && <p className="mt-4 max-w-md text-muted">{children}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

// Page loading placeholder that respects the canvas.
export function PageLoader({ label = "Loading" }) {
  return (
    <div className="container-x flex min-h-screen items-center justify-center pt-28">
      <div className="flex items-center gap-3 text-muted">
        <Spinner />
        <span className="eyebrow">{label}</span>
      </div>
    </div>
  );
}

// Modal shell: dimmed backdrop, hairline sheet, escape to close.
export function Modal({ open, onClose, title, eyebrow, children, size = "md", className = "" }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            data-lenis-prevent
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className={`max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] border border-line/10 bg-surface p-6 text-ink sm:rounded-[28px] md:p-8 ${widths[size]} ${className}`}
          >
            {(title || onClose) && (
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
                  {title && <h2 className="display-tight text-2xl md:text-3xl">{title}</h2>}
                </div>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line/15 transition-colors hover:border-ink"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Shared class strings for form controls that aren't underline fields.
export const pillField =
  "rounded-full border border-line/15 bg-transparent px-4 py-2.5 text-sm text-ink outline-none transition-colors hover:border-ink focus:border-ink [&>option]:bg-surface";

export const boxField =
  "w-full rounded-2xl border border-line/15 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-ink";

export const iconBtn =
  "grid h-10 w-10 place-items-center rounded-full border border-line/15 text-ink transition-colors hover:border-ink";
