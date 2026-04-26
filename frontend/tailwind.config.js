/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // ✅ Added secondary gradient colors
        secondary: {
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
        },
        dark: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        display: ["Clash Display", "Plus Jakarta Sans", "sans-serif"],
      },
      // ✅ Enhanced animations
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "bounce-slow": "bounce 2s infinite",
        // New animations for premium UI
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
        "zoom-in": "zoomIn 0.3s ease-out",
        "rotate-y": "rotateY 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        // New keyframes for premium effects
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(245, 158, 11, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(245, 158, 11, 0.6)" },
        },
        slideInLeft: {
          "0%": { opacity: 0, transform: "translateX(-30px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: 0, transform: "translateX(30px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        zoomIn: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        rotateY: {
          "0%": { opacity: 0, transform: "rotateY(-90deg)" },
          "100%": { opacity: 1, transform: "rotateY(0)" },
        },
      },
      // ✅ New box shadows
      boxShadow: {
        glow: "0 0 20px rgba(245, 158, 11, 0.3)",
        "glow-lg": "0 0 30px rgba(245, 158, 11, 0.4)",
        "3xl": "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
        "4xl": "0 45px 70px -20px rgba(0, 0, 0, 0.4)",
        "inner-lg": "inset 0 2px 10px 0 rgba(0, 0, 0, 0.05)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      },
      // ✅ Backdrop blur utilities
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },
      // ✅ Background gradients
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
        "dark-glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))",
      },
      // ✅ Scale utilities
      scale: {
        102: "1.02",
        105: "1.05",
        110: "1.10",
      },
      // ✅ Transition timing functions
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      // ✅ Custom spacing
      spacing: {
        18: "4.5rem",
        88: "22rem",
        100: "25rem",
        112: "28rem",
        128: "32rem",
      },
    },
  },
  plugins: [
    // ✅ Add custom utilities
    function ({ addUtilities }) {
      const newUtilities = {
        ".text-shadow": {
          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
        ".text-shadow-lg": {
          textShadow: "0 4px 8px rgba(0,0,0,0.15)",
        },
        ".text-shadow-xl": {
          textShadow: "0 8px 16px rgba(0,0,0,0.2)",
        },
        ".animation-delay-100": {
          animationDelay: "100ms",
        },
        ".animation-delay-200": {
          animationDelay: "200ms",
        },
        ".animation-delay-300": {
          animationDelay: "300ms",
        },
        ".animation-delay-500": {
          animationDelay: "500ms",
        },
        ".animation-delay-1000": {
          animationDelay: "1000ms",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
