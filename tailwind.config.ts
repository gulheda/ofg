import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#121212",
        surface: "#1A1A1A",
        card: "#1F1F1F",
        ink: "#E0E0E0",
        accent: {
          DEFAULT: "#00D2FF",
          light: "#6EE7FF",
          deep: "#0092B8",
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
        glow: "0 0 40px -10px rgba(0,210,255,0.45)",
        "glow-sm": "0 0 22px -8px rgba(0,210,255,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
