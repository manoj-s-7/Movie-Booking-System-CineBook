/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#09090f",
          800: "#0f0f1a",
          700: "#14142b",
          600: "#1a1a35",
          500: "#22224a",
        },
        accent: {
          primary: "#7c3aed",
          secondary: "#a855f7",
          glow: "#c084fc",
          orange: "#f97316",
        },
      },
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cinema-grid": "linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "slide-in": "slideIn 0.4s ease-out forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "shimmer": "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeUp: { "0%": { opacity: 0, transform: "translateY(20px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        slideIn: { "0%": { opacity: 0, transform: "translateX(-20px)" }, "100%": { opacity: 1, transform: "translateX(0)" } },
        pulseGlow: { "0%,100%": { boxShadow: "0 0 20px rgba(124,58,237,0.3)" }, "50%": { boxShadow: "0 0 40px rgba(124,58,237,0.6)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};
