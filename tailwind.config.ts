import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#05091A",
        surface: "#080D24",
        card: "#0B1230",
        ink: "#E4E7EF",
        accent: {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
          deep: "#2563EB",
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
        glow: "0 0 40px -10px rgba(59,130,246,0.45)",
        "glow-sm": "0 0 22px -8px rgba(59,130,246,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
