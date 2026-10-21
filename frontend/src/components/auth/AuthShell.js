import React from "react";
import { motion } from "framer-motion";
import { SplitText, EASE } from "../motion";

// Split layout shared by the sign-in and sign-up pages: an editorial
// image panel on large screens and the form on the right.
export default function AuthShell({ eyebrow, title, subtitle, image, quote, children }) {
  return (
    <div className="container-x grid min-h-screen gap-10 pb-12 pt-24 lg:grid-cols-2 lg:gap-16 lg:pt-28">
      <motion.div
        initial={{ clipPath: "inset(0 0 100% 0 round 28px)" }}
        animate={{ clipPath: "inset(0 0 0% 0 round 28px)" }}
        transition={{ duration: 1.3, ease: EASE }}
        className="relative hidden overflow-hidden rounded-[28px] lg:block"
      >
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <p className="display-tight max-w-md text-3xl leading-tight">“{quote.text}”</p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">
            {quote.author}
          </p>
        </div>
      </motion.div>

      <div className="flex items-center">
        <div className="mx-auto w-full max-w-md">
          <p className="eyebrow mb-6">{eyebrow}</p>
          <h1 className="display text-5xl md:text-6xl">
            <SplitText lines={title} delay={0.2} />
          </h1>
          {subtitle && <p className="mt-4 text-muted">{subtitle}</p>}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
            className="mt-10"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
