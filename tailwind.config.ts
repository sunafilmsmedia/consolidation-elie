import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        brand: "#2563EB",
        ai: "#A855F7",
        savings: "#22C55E",
        alert: "#F97316",
        surface: "#F8FAFC",
        muted: "#64748B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 40px -12px rgba(15, 23, 42, 0.18)",
        glow: "0 0 0 1px rgba(37,99,235,0.2), 0 12px 32px -8px rgba(37,99,235,0.45)",
      },
      keyframes: {
        gradientMove: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        gradientMove: "gradientMove 6s ease infinite",
        fadeUp: "fadeUp 0.4s ease both",
        pulseSoft: "pulseSoft 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
