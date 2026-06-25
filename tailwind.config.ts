import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#04110E", // noir profond teinté teal
        brand: "#00897B", // teal Alliance Hypothécaire (principal)
        ai: "#00B29C", // teal plus clair (partenaire de dégradé)
        neon: "#00C9A7", // teal lumineux (accents sur fond foncé)
        savings: "#00C9A7",
        alert: "#F97316",
        surface: "#0b0f0c",
        muted: "#94a3b8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["DM Serif Display", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 10px 40px -12px rgba(0, 0, 0, 0.6)",
        glow: "0 0 0 1px rgba(0,201,167,0.35), 0 0 28px -4px rgba(0,201,167,0.5)",
        neon: "0 0 24px -2px rgba(0,201,167,0.6)",
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
