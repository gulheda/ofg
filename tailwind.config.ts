import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        surface: "#111111",
        card: "#18181B",
        accent: {
          DEFAULT: "#3B82F6",
          cyan: "#22D3EE",
          violet: "#8B5CF6",
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
        glow: "0 0 40px -12px rgba(59,130,246,0.35)",
        "glow-sm": "0 0 24px -10px rgba(59,130,246,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
