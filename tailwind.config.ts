import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A1330",
        surface: "#0F1938",
        card: "#132043",
        ink: "#E4E7EF",
        accent: {
          DEFAULT: "#2DD4BF",
          light: "#5EEAD4",
          deep: "#0D9488",
        },
        gold: {
          DEFAULT: "#F5B242",
          light: "#FFD37A",
        },
      },
      borderColor: {
        subtle: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        content: "72rem",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(45,212,191,0.45)",
        "glow-sm": "0 0 22px -8px rgba(45,212,191,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
