import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A1224",
        surface: "#101C33",
        card: "#16223E",
        accent: {
          DEFAULT: "#3B74DC",
          light: "#7FA8EE",
          deep: "#1F3B73",
        },
      },
      borderColor: {
        subtle: "rgba(148,171,214,0.12)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        content: "72rem",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(59,116,220,0.4)",
        "glow-sm": "0 0 22px -8px rgba(59,116,220,0.32)",
      },
    },
  },
  plugins: [],
};

export default config;
