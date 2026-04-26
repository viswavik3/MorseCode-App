/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Sora", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.05), 0 18px 40px rgba(0,0,0,0.35)",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.45" },
          "100%": { transform: "scale(1.3)", opacity: "0" },
        },
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-ring": "pulseRing 1.3s ease-out infinite",
        "rise-in": "riseIn 500ms ease-out both",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(56,189,248,0.18), transparent 28%), radial-gradient(circle at top right, rgba(168,85,247,0.14), transparent 24%), radial-gradient(circle at bottom center, rgba(16,185,129,0.12), transparent 26%)",
      },
    },
  },
  plugins: [],
};
