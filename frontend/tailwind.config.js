/** @type {import('tailwindcss').Config} */

// Design tokens live as CSS variables in src/index.css (light + dark).
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

// Warm neutral scale. Replaces Tailwind's cool gray so every existing
// gray-* utility in the app picks up the new palette.
const warmGray = {
  50: "#F4F1EA",
  100: "#ECE8E0",
  200: "#DEDAD1",
  300: "#C6C2B9",
  400: "#9D9A93",
  500: "#6F6D68",
  600: "#4A4946",
  700: "#2C2C2E",
  800: "#1C1C1F",
  900: "#141416",
  950: "#0B0B0C",
};

// Amber. Replaces amber/orange/pink/yellow so old accent utilities
// collapse into a single brand accent instead of a rainbow of gradients.
const signal = {
  50: "#FFFBEB",
  100: "#FEF3C7",
  200: "#FDE68A",
  300: "#FCD34D",
  400: "#FBBF24",
  500: "#F59E0B",
  600: "#D97706",
  700: "#B45309",
  800: "#92400E",
  900: "#78350F",
  950: "#451A03",
};

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: token("surface"),
        raised: token("raised"),
        ink: token("ink"),
        muted: token("muted"),
        line: token("line"),
        accent: token("accent"),
        "accent-ink": token("accent-ink"),
        gray: warmGray,
        amber: signal,
        orange: signal,
        pink: signal,
        yellow: signal,
      },
      // text-accent (and hover:/group-hover: variants) read a darker amber in
      // light mode so amber text stays readable; fills keep the brand amber.
      textColor: {
        accent: token("accent-text"),
      },
      fontFamily: {
        sans: ['"Inter Tight"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Archivo"', '"Inter Tight"', "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "fade-in": "fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
