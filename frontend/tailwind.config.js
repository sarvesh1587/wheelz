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

// Signal orange. Replaces amber/orange/pink so old accent utilities
// collapse into a single brand accent instead of a rainbow of gradients.
const signal = {
  50: "#FFF2EC",
  100: "#FFE0D1",
  200: "#FFBE9F",
  300: "#FF9567",
  400: "#FF6E33",
  500: "#FF4D00",
  600: "#E04300",
  700: "#B33600",
  800: "#852800",
  900: "#5A1B00",
  950: "#2E0E00",
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
